import big_integer from "./big_integer";

function is_big_rational(a) {
  return (
    typeof a === "object" &&
    big_integer.is_big_integer(a.numerator) &&
    big_integer.is_big_integer(a.denominator)
  );
}

function is_integer(a) {
  return (
    big_integer.eq(big_integer.one, a.denominator) ||
    big_integer.is_zero(big_integer.divrem(a.numerator, a.denominator)[1])
  );
}

function is_negative(a) {
  return big_integer.is_negative(a.numerator);
}

// 유용한 상수들
function make_big_rational(numerator, denominator) {
  const new_big_rational = Object.create(null);
  new_big_rational.numerator = numerator;
  new_big_rational.denominator = denominator;
  return Object.freeze(new_big_rational);
}
const zero = make_big_rational(big_integer.zero, big_integer.one);
const one = make_big_rational(big_integer.one, big_integer.one);
const two = make_big_rational(big_integer.two, big_integer.one);

function neg(a) {
  return make(big_integer.neg(a.numerator), a.denominator);
}

function abs(a) {
  return is_negative(a) ? neg(a) : a;
}

/**
 * 더하기와 빼기의 경우, 분모가 똑같으면 분자를 더하거나 빼면 된다.
 * 분모가 다르면, 다음과 같이 두 번의 곱셈과 한 번의 덧셈, 그리고 또 한번의 곱셈을 해야 한다.
 * (a/b)+(c/d)=((a*d)+(b*c))/(b*d)
 */
function conform_op(op) {
  return function (a, b) {
    try {
      if (big_integer.eq(a.denominator, b.denominator)) {
        return make(op(a.numerator, b.numerator), a.denominator);
      }
      return normalize(
        make(
          op(
            big_integer.mul(a.numerator, b.denominator),
            big_integer.mul(b.numerator, a.denominator),
            big_integer.mul(a.denominator, b.denominator)
          )
        )
      );
    } catch (ignore) {}
  };
}
const add = conform_op(big_integer.add);
const sub = conform_op(big_integer.sub);

/**
 * inc 함수는 분자에 분모 값을 더해서 유리수를 1만큼 증가시킨다.
 * dec 함수는 분자에서 분모를 빼 1만큼 감소시킨다.
 */
function int(a) {
  return make(big_integer.add(a.numerator, a.denominator), a.denominator);
}
function dec(a) {
  return make(big_integer.sub(a.numerator, a.denominator), a.denominator);
}

/**
 * 곱하기의 경우, 분자와 분모를 서로 곱하면 된다.
 * 나누기는 두 번째 인자의 분자와 분모를 바꿔서 곱하면 된다.
 */
function mul(multiplicand, multiplier) {
  return make(
    big_integer.mul(multiplicand.numerator, multiplier.numerator),
    big_integer.mul(multiplicand.denominator, multiplier.denominator)
  );
}
function div(a, b) {
  return make(
    big_integer.mul(a.numerator, b.denominator),
    big_integer.mul(a.denominator, b.numerator)
  );
}

function remainder(a, b) {
  const quotient = div(normalize(a), normalize(b));
  return make(big_integer.divrem(quotient.numerator, quotient.denominator)[1]);
}

function reciprocal(a) {
  return make(a.denominator, a.numerator);
}

function integer(a) {
  return a.denominator === one
    ? a
    : make(big_integer.div(a.numerator, a.denominator), big_integer.one);
}

function fraction(a) {
  return sub(a, integer(a));
}

/**
 * normalize 함수는 유리수의 분자와 분모에 공통 인수가 없게 만든다.
 * 분자와 분모를 최대 공약수로 나누면 된다.
 * 정규화를 하면 유리수 객체 내의 큰 정수 값이 작아져서 메모리 사용량을 줄일 수도 있고 연산이 빨라질 수도 있다.
 */
function normalize(a) {
  let { numerator, denominator } = a;
  if (big_integer.eq(big_integer.one, denominator)) return a;

  let g_c_d = big_integer.gcd(numerator, denominator);
  return big_integer.eq(big_integer.one, g_c_d)
    ? a
    : make(
        big_integer.div(numerator, g_c_d),
        big_integer.div(denominator, g_c_d)
      );
}

/**
 * 두 개의 유리수가 같은지 비교하기 위해 각 유리수를 정규화할 필요는 없다.
 * 만약 a/b=c/d 라면, a*d=b*c 와 같이 비교할 수 있다.
 */
function eq(comparahend, comparator) {
  return comparahend === comparator
    ? true
    : big_integer.eq(comparahend.denominator, comparator.denominator)
    ? big_integer.eq(comparahend.numerator, comparator.numerator)
    : big_integer.eq(
        big_integer.mul(comparahend.numerator, comparator.denominator),
        big_integer.mul(comparator.numerator, comparahend.denominator)
      );
}

function lt(comparahend, comparator) {
  return is_negative(comparahend) != is_negative(comparator)
    ? is_negative(comparator)
    : is_negative(sub(comparahend, comparator));
}

/**
 * make 함수는 여러 인자를 받아들여서 numerator와 denominator를 포함하는 유리수 객체로 만들어 준다.
 * 이 변환은 정확하다.
 * 유한한 어떤 자바스크립트 숫자 값도 받을 수 있으며, 추가 손실 없이 유리수로 변환한다.
 */
const number_pattern = /^(-?)(?:(\d+)(?:(?:\u0020(\d+))?\/(\d+)|(?:\.(\d*))?(?:e(-?\d+))?)|\.(\d+))$/;
function make(numerator, denominator) {
  /**
   * 두 개의 인자를 전달하면 둘 다 큰 정수로 변환된다.
   * 반환 값은 분자와 분모를 가진 객체이다.
   * 하나의 인자만 전달받으면 우선 그 인자가 무엇인지 알아내야 한다.
   * 인자가 문자열이라면, 정수와 유리수가 혼합된 형태인지, 소수점 형태인지 분석한다.
   * 인자가 숫자라면 분해하고, 모든 경우에 해당하지 않으면 빠트린 두 번째 인자 값을 1이라고 가정한다.
   */
  if (denominator !== undefined) {
    // 분모와 분자로 유리수를 만든다.
    numerator = big_integer.make(numerator);
    // 분자가 0이라면 분모는 신경 쓰지 않고 0을 반환한다.
    if (big_integer.zero === numerator) return zero;

    denominator = big_integer.make(denominator);
    if (
      !big_integer.is_big_integer(numerator) ||
      !big_integer.is_big_integer(denominator) ||
      big_integer.zero === denominator
    ) {
      return undefined;
    }

    // 분모가 음수라면 분모를 양수로 바꾸고 분자의 부호를 바꾼다.
    if (big_integer.is_negative(denominator)) {
      numerator = big_integer.neg(numerator);
      denominator = big_integer.abs(denominator);
    }
    return make_big_rational(numerator, denominator);
  }

  // 인자가 문자열이라면 분석을 시도한다.
  if (typeof numerator === "string") {
    let parts = numerator.match(number_pattern);
    if (!parts) return undefined;

    // Capturing groups:
    // [1] sign
    // [2] integer
    // [3] top
    // [4] bottom
    // [5] frac
    // [6] exp
    // [7] naked frac

    if (parts[7]) {
      return make(
        big_integer.make(parts[1] + parts[7]),
        big_integer.power(big_integer.ten, parts[7].length)
      );
    }
    if (parts[4]) {
      let bottom = big_integer.make(parts[4]);
      if (parts[3]) {
        return make(
          big_integer.add(
            big_integer.mul(big_integer.make(parts[1] + parts[2]), bottom),
            big_integer.make(parts[3])
          ),
          bottom
        );
      }
      return make(parts[1] + parts[2], bottom);
    }
    let frac = parts[5] || "";
    let exp = (Number(parts[6]) || 0) - frac.length;
    if (exp < 0) {
      return make(
        parts[1] + parts[2] + frac,
        big_integer.power(big_integer.ten, -exp)
      );
    }
    return make(
      big_integer.mul(
        big_integer.make(parts[1] + parts[2] + parts[5]),
        big_integer.power(big_integer.ten, exp)
      ),
      big_integer.one
    );
  }

  // 인자가 숫자라면 분해하고 다시 구성한다.
  if (typeof numerator === "number" && !Number.isSafeInteger(numerator)) {
    let { sign, coefficient, exponent } = deconstruct(numerator);
    if (sign < 0) coefficient = -coefficient;

    coefficient = big_integer.make(coefficient);
    if (exponent >= 0) {
      return make(
        big_integer.mul(
          coefficient,
          big_integer.power(big_integer.two, exponent)
        ),
        big_integer.one
      );
    }
    return normalize(
      make(coefficient, big_integer.power(big_integer.two, -exponent))
    );
  }
  return make(numerator, big_integer.one);
}

/**
 * number 함수는 큰 유리수를 자바스크립트 수로 변환한다.
 * 값이 안전한 정수 범위를 벗어나면 변환이 정확하다고 보장할 수 없다.
 */
function number(a) {
  return big_integer.number(a.numerator) / big_integer.number(a.denominator);
}

/**
 * string 함수는 큰 유리수를 문자열로 바꾼다. 이 변환은 아주 정확하다.
 */
function string(a, nr_places) {
  if (a === zero) return "0";
  let { numerator, denominator } = normalize(a);

  // 분자를 분모로 나눈다. 나머지가 없으면 우리가 원하는 값이다.
  let [quotient, remains] = big_integer.divrem(numerator, denominator);
  let result = big_integer.string(quotient);
  if (remains !== big_integer.zero) {
    /**
     * nr_places를 전달하면 결과 값을 소수점 형태로 만든다.
     * 나머지는 10의 멱승만큼 곱해서 크기를 증가시켜서 정수 형태로 만든 다음 나누기를 다시 한다.
     * 나머지가 분모의 절반보다 크거나 같다면 반올림한다.
     */
    remains = big_integer.abs(remains);
    if (nr_places !== undefined) {
      let [fractus, residue] = big_integer.divrem(
        big_integer.mul(remains, big_integer.power(big_integer.ten, nr_places)),
        denominator
      );
      if (
        !big_integer.abs_lt(
          big_integer.mul(residue, big_integer.two),
          denominator
        )
      ) {
        fractus = big_integer.add(fractus, big_integer.one);
      }
      result +=
        "." +
        big_integer
          .string(fractus)
          .padStart(big_integer.number(nr_places), "0");
    } else {
      // 결과는 몫과 분수가 섞인 형태이다.
      result =
        (result === "0" ? "" : result + " ") +
        big_integer.string(remains) +
        "/" +
        big_integer.string(denominator);
    }
  }
  return result;
}

export default Object.freeze({
  abs,
  add,
  dec,
  div,
  dq,
  fraction,
  inc,
  integer,
  is_big_rational,
  is_integer,
  is_negative,
  lt,
  make,
  mul,
  neg,
  normalize,
  number,
  one,
  reciprocal,
  remainder,
  string,
  sub,
  two,
  zero,
});
