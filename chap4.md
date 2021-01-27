# 큰 부동소수점

자바스크립트의 숫자형은 그 크기의 제한이나 정확도에 문제가 있는 것이 아니라,  
사람들이 많이 사용하는 수, 즉 10진수를 정확하게 표현할 수 없다는 것이 문제이다.  
다음 세대 언어에서는 [DEC64](https://www.crockford.com/dec64.html) 같은 것을 사용하는 것이 좋을 것 같다고 저자는 말한다.

큰 정수 시스템은 정수 문제에 국한되므로 이번에는 큰 부동소수점 시스템을 만들어보자.  
부동소수점 시스템은 세 가지 숫자, 계수(coefficient), 지수(exponent), 밑수(basis)로 구성된다.  
`값 = 계수 * (밑수 ** 지수)`

IEEE 754 규격은 부동소수점 수의 밑수로 2를 사용한다.  
이제는 무어의 법칙 덕분에 그 제약이 없어졌다.  
이전에 만든 큰 정쑤는 24비트 크기의 요소를 사용하는 배열로 구성된다.  
즉, 한 자리가 2 ** 24만큼의 정밀도를 가지는 것이다.  
그래서 밑수를 2 ** 24, 즉 16777216을 사용하면 자릿수가 늘거나 줄어도 배열에 요소를 더하거나 빼는 방식으로 쉽게 처리할 수 있다.

큰 부동소수점 수는 coefficient와 exponent를 가진 객체로 표현한다.

```javascript
import big_integer from "./big_integer";

// is_big_float 함수는 big float 객체인지 아닌지 알려 준다.
function is_big_float(big) {
  return (
    typeof big === "object" &&
    big_integer.is_big_integer(big.coefficient) &&
    Number.isSafeInteger(big.exponent)
  );
}

function is_negative(big) {
  return big_integer.is_negative(big.coefficient);
}

function is_positive(big) {
  return big_integer.is_positive(big.coefficient);
}

function is_zero(big) {
  return big_integer.is_zero(big.coefficient);
}

//zero는 모든 요소(계수, 밑수, 지수)가 0인 값
const zero = Object.create(null);
zero.coefficient = big_integer.zero;
zero.exponent = 0;
Object.freeze(zero);

function make_big_float(coefficient, exponent) {
  if (big_integer.is_zero(coefficient)) return zero;
  const new_big_float = Object.create(null);
  new_big_float.coefficient = coefficient;
  new_big_float.exponent = exponent;
  return Object.freeze(new_big_float);
}

const big_integer_ten_million = big_integer.make(10000000);

/**
 * numer 함수는 큰 부동소수점 값을 자바스크립트 수로 바꾼다.
 * 값이 안전한 정수 범위를 벗어나는 경우에는 변환이 정확하다고 보장할 수 없다.
 * 자바스크립트 수 외에도 다른 형으로 변환할 수 있도록 만들어보자.
 */
function number(a) {
  return is_big_float(a)
    ? a.exponent === 0
      ? big_integer.number(a.coefficient)
      : big_integer.number(a.coefficient) * 10 ** a.exponent
    : typeof a === "number"
    ? a
    : big_integer.is_big_integer(a)
    ? big_integer.number(a)
    : Number(a);
}

function neg(a) {
  return make_big_float(big_integer.neg(a.coefficient), a.exponent);
}

function abs(a) {
  return is_negative(a) ? neg(a) : a;
}

/**
 * 더하기와 빼기는 간단하다. 지수가 같은 경우에는 계수를 더하기만 된다. 지수가 다르면 지수를 같게 만든다.
 * conform_op 함수에 big_integer.add 함수를 인자로 전달하면 부동소수점 add 함수를 반환한다.
 * big_integer.sub를 전달하면 sub 함수를 반환한다.
 */
function conform_op(op) {
  return function (a, b) {
    const differential = a.exponent - b.exponent;
    return differential === 0
      ? make_big_float(op(a.coefficient, b.coefficient), a.exponent)
      : differential < 0
      ? make_big_float(
          op(
            big_integer.mul(
              a.coefficient,
              big_integer.power(big_integer.ten, -differential)
            ),
            b.coefficient
          ),
          b.exponent
        )
      : make_big_float(
          op(
            a.coefficient,
            big_integer.mul(
              b.coefficient,
              big_integer.power(big_integer.ten, differential)
            ),
            a.exponent
          )
        );
  };
}
const add = conform_op(big_integer.add);
const sub = conform_op(big_integer.sub);

// 곱하기의 경우, 계수를 곱하고 지수를 더한다.
function mul(multiplicand, multiplier) {
  return make_big_float(
    big_integer.mul(multiplicand.coefficient, multiplier.coefficient),
    multiplicand.exponent + multiplier.exponent
  );
}

/**
 * 나누기의 어려운 점은, 나누기를 언제까지 해야 할지 모른다는 것이다.
 * 정수에 대한 나누기는 모든 자릿수에 대해 나누기를 하면 끝난다.
 * 고정 크기 부동소수점 나누기는 모든 비트를 다 소진하면 끝난다.
 * 하지만 큰 정수는 그 크기에 제한이 없다. 나누기가 언제 나누어 떨어지는지 알 수가 없다.
 * 그래서 나누기를 언제 끝낼지는, 나누기 결과의 정확도 값을 선택적인 인자로 전달받게끔 하여 정하도록 하자.
 * 기준 위치는 0이며, 소수점의 위치는 음수로 표현된다. 기본 값은 -4, 즉 소수점 아래 네 자리로 하자.
 */
function div(dividend, divisor, precision = -4) {
  if (is_zero(dividend)) return zero;
  if (is_zero(divisor)) return undefined;
  let { coefficient, exponent } = dividend;
  exponent -= divisor.exponent;

  // 계수으 ㅣ크기를 원하는 정확도만큼 조절한다.
  if (typeof precision !== "number") precision = number(precision);
  if (exponent > precision) {
    coefficient = big_integer.mul(
      coefficient,
      big_integer.power(big_integer.ten, exponent - precision)
    );
    exponent = precision;
  }
  let remainder;
  [coefficient, remainder] = big_integer.divrem(
    coefficient,
    divisor.coefficient
  );

  // 필요한 경우 결과를 반올림한다.
  if (
    !big_integer.abs_lt(
      big_integer.add(remainder, remainder),
      divisor.coefficient
    )
  ) {
    coefficient = big_integer.add(
      coefficient,
      big_integer.signum(dividend.coefficient)
    );
  }
  return make_big_float(coefficient, exponent);
}

/**
 * 정규화의 경우, 유효 숫자를 잃지 않는 범위 내에서 지수를 가능한 한 0에 가까운 수로 만들어 구현한다.
 */
function normalize(a) {
  let { coefficient, exponent } = a;
  if (coefficient.length < 2) return zero;

  // 지수가 0이라면 이미 정규화된 상태
  if (exponent !== 0) {
    // 지수가 양수라면 계수에 '10 ** 지수 값'을 곱한다.
    if (exponent > 0) {
      coefficient = big_integer.mul(
        coefficient,
        big_integer.power(big_integer.ten, exponent)
      );
      exponent = 0;
    } else {
      let quotient, remainder;

      // 지수가 음수이고 게수가 10으로 나누어 떨어지면, 계수를 10으로 나누고 지수에 1을 더한다.
      // 좀 더 빨리 처리할 수 있도록 처음에는 천만 단위로 나눠서 계수에서 0을 한번에 7개씩 제거한다.
      while (exponent <= -7 && (coefficient[1] & 127) === 0) {
        [quotient, remainder] = big_integer.divrem(
          coefficient,
          big_integer_ten_million
        );
        if (remainder !== big_integer.zero) break;
        coefficient = quotient;
        exponent += 7;
      }
      while (exponent < 0 && (coefficient[1] & 1) === 0) {
        [quotient, remainder] = big_integer.divrem(
          coefficient,
          big_integer.ten
        );
        if (remainder !== big_integer.zero) break;
        coefficient = quotient;
        exponent += 1;
      }
    }
  }
  return make_big_float(coefficient, exponent);
}

// make 함수는 큰 정수나 문자열, 자바스크립트 수를 큰 부동소수점 수로 바꾼다. 이 변환은 정확하다.
const number_pattern = /^(-?\d+)(?:\.(\d*))?(?:e(-?\d+))?$/;

// Capturing groups
// [1] int
// [2] frac
// [3] exp

function make(a, b) {
  // (big_integer)
  // (big_integer, exponent)
  // (string)
  // (string, radix)
  // (number)

  if (big_integer.is_big_integer(a)) return make_big_float(a, b || 0);
  if (typeof a === "string") {
    if (Number.isSafeInteger(b)) return make(big_integer.make(a, b), 0);
    let parts = a.match(number_pattern);
    if (parts) {
      let frac = parts[2] || "";
      return make(
        big_integer.make(parts[1] + frac),
        (Number(parts[3]) || 0) - frac.length
      );
    }
  }

  // a가 자바스크립트의 숫자형이라면 밑수가 2인 지수와 게수로 분해하고,
  // 이를 다시 정확한 큰 부동소수점 수로 바꾼다.
  if (typeof a === "number" && Number.isFinite(a)) {
    if (a === 0) return zero;
    let { sign, coefficient, exponent } = deconstruct(a);
    if (sign < 0) coefficient = -coefficient;
    coefficient = big_integer.make(coefficient);

    // 지수가 음수라면 2 ** abs(exponent)로 나눈다.
    if (exponent < 0) {
      return normalize(
        div(
          make(coefficient, 0),
          make(big_integer.power(big_integer.two, -exponent), 0),
          b
        )
      );
    }

    // 지수가 양수라면 계수에 '2 ** 지수'를 곱한다.
    if (exponent > 0) {
      coefficient = big_integer.mul(
        coefficient,
        big_integer.power(big_integer.two, exponent)
      );
      exponent = 0;
    }
    return make(coefficient, exponent);
  }
  if (is_big_float(a)) return a;
}

function string(a, radix) {
  if (is_zero(a)) return "0";
  if (is_big_float(radix)) {
    radix = normalize(radix);
    return radix && radix.exponent === 0
      ? big_integer.string(integer(a).coefficient, radix.coefficient)
      : undefined;
  }
  a = normalize(a);
  let s = big_integer.string(big_integer.abs(a.coefficient));
  if (a.exponent < 0) {
    let point = s.length + a.exponent;
    if (point <= 0) {
      s = "0".repeat(1 - point) + s;
      point = 1;
    }
    s = s.slice(0, point) + "." + s.slice(point);
  } else if (a.exponent > 0) s += "0".repeat(a.exponent);
  if (big_integer.is_negative(a.coefficient)) s = "-" + s;
  return s;
}

// scientific 함수는 큰 부동소수점 수를 e 표기법을 사용하는 문자열로 바꿔 준다.
function scientific(a) {
  if (is_zero(a)) return "0";
  a - normalize(a);
  let s = big_integer.string(big_integer.abs(a.coefficient));
  let e = a.exponent + s.length - 1;
  if (s.length > 1) s = s.slice(0, 1) + "." + s.slice(1);
  if (e !== 0) s += "e" + e;
  if (big_integer.is_negative(a.coefficient)) s = "-" + s;
  return s;
}

export default Object.freeze({
  abs,
  add,
  div,
  eq,
  fraction,
  integer,
  is_big_float,
  is_negative,
  is_positive,
  is_zero,
  lt,
  make,
  mul,
  neg,
  normalize,
  number,
  scientific,
  string,
  sub,
  zero,
});
```
