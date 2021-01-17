# 숫자

자바스크립트는 number라는 하나의 숫자형을 가진다.
타입 변환으로 인한 오류도 없으며, 오버플로우도 발생하지 않는다.
`js: 2147483647+1 = 2147483648`
`java: 2147483647+1 = -2147483648`

number는 인텔의 iAPX-432 프로세서를 위해 처음 개발된 IEEE 부동소수점 연산 표준(IEEE 754)을 차용했다.

부동소수점의 아이디어는 두 개의 수로 하나의 숫자를 표현하는 것이다.
첫 번째 수는 계수, 유효 숫자, 분수, 또는 가수라고도 불리는 숫자이다.
두 번째 수는 지수로, 첫 번째 수에서 10진 소수점(혹은 2진 소수점)의 위치를 나타낸다.
고정된 형식에 맞춰서 제한된 수의 비트를 초ㅚ대한 잘 써야 하므로, 부동소수점 수의 구현은 상당히 복잡하다.

## 영(0)

IEEE 754 표준에는 0과 -0의 두 개의 0이 있다.

```javascript
1 / 0 === 1 / -0; //false
Object.is(0, -0); //false
```

## 숫자 리터럴

NaN은 'Not a Number'으로, typeof NaN = "number"이지만 NaN === NaN은 false를 반환한다.
NaN인지 아닌지를 테스트하려면 `Number.isNaN(val)`을 사용해야 한다.
`Number.isFinite(val)`은 값이 NaN, Infinity, -Infinify인 경우 false를 반환한다.

Number는 몇몇 상수 또한 포함하고 있다.

- `Number.EPSILON`은 1에 더했을 때 1보다 큰 수를 만들어 낼 수 있는 가장 작은 양수
- `Number.MAX_SAFE_INTEGER`
- `Number.MAX_VALUE`
- `Number.MIN_VALUE`는 0보다 큰 수 중에서 가장 작은 수. 이보다 작은 양수는 0과 구별 불가능
- `Number,prototype`은 모든 수가 상속하는 객채

## 숫자 속의 괴물

```javascript
// 숫자를 분해하여 부호와 정수 계수, 지수와 같은 구성요소로 나눈다.
function deconstruct(number) {
  // number = sign * coefficient * 2 ** exponent;
  let sign = 1;
  let coefficient = number;
  let exponent = 0;

  // 계수에서 부호 제거
  if (coefficient < 0) {
    coefficient = -coefficient;
    sign = -1;
  }

  /**
   * 계수를 줄인다.
   * 계수가 0이 될 때까지 2로 나누고, 나눈 횟수를 -1128에 더해서 지수를 구한다.
   * -1128이라는 값은 Number.MIN_VALUE의 지수 값에서 유효 숫자의 비트 개수, 그리고 보너스 비트의 개수를 뺀 값이다.
   */
  if (Number.isFinite(number) && number !== 0) {
    exponent = -1128;
    let reduction = coefficient;
    while (reduction !== 0) {
      /**
       * 반복문은 reduction이 0이 될 때까지 실행되며, reduction은 반드시 0이 된다. (Number.MIN_VALUe보다 작은 수는 0이 되기 때문)
       * 지수가 작아서 더 이상 줄일 수 없을 때, 대신 내부 부정규 유효 숫자를 오른쪽으로 시프트 한다.
       * 최종적으로 모든 비트가 이동한다.
       */
      exponent += 1;
      reduction /= 2;
    }
    /**
     * 지수를 줄인다.
     * 지수 값이 0이면 수가 정수 형태로 보일 것이고,
     * 0이 아니라면 수정하여 계수를 바로 잡는다.
     */
    reduction = exponent;
    while (reduction > 0) {
      coefficient /= 2;
      reduction -= 1;
    }
    while (reduction < 0) {
      coefficient *= 2;
      reduction += 1;
    }
  }
  // 부호, 계수, 지수, 원래 숫자를 가진 객체 반환
  return {
    sign,
    coefficient,
    exponent,
    number,
  };
}

// Number.MAX_SAFE_INTEGER는 부호가 있는 54비트 정수와 딱 들어맞는 가장 큰 숫자
console.log(deconstruct(Number.MAX_SAFE_INTEGER));
// {
//     sign: 1,
//     coefficient: 9007199254740991,
//     exponent: 0,
//     number: 9007199254740991
//   }

console.log(deconstruct(1));
// { sign: 1, coefficient: 9007199254740992, exponent: -53, number: 1 }
/**
 * 1 * 9007199254740992 * (2 ** -53) = 1
 */

console.log(deconstruct(0.1));
// { sign: 1, coefficient: 7205759403792794, exponent: -56, number: 0.1 }
/**
 * 1 * 7205759403792794 * (2 ** -56)은 실제로 0.1이 아니다.
 */

/** 자바스크립트는 10진 소수 값, 특히 화폐 단위를 처리하는 능력이 좋지 않다.
 * 0.1 또는 그 외 10진 소수 값을 프로그램에 입력하면, 자바스크립트는 그 값을 제대로 처리할 수 없다.
 * 그래서 그 대신 값을 정확히 표현할 수 있는 별칭(alias)를 사용한다.
 */

/**
 * 2진 부동소수점 시스템의 부정확성
 * 0.1과 0.2를 더해서 정확한 0.3을 구할 수 없다?!
 */
console.log(deconstruct(0.3));
// { sign: 1, coefficient: 10808639105689190, exponent: -55, number: 0.3 }
console.log(deconstruct(0.1 + 0.2));
// {
//   sign: 1,
//   coefficient: 10808639105689192,
//   exponent: -55,
//   number: 0.30000000000000004
// }
console.log(deconstruct(100 / 3));
// {
//   sign: 1,
//   coefficient: 9382499223688534,
//   exponent: -48,
//   number: 33.333333333333336
// }
```
