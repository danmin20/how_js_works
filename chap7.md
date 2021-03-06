# 배열

배열은 연속적인 메모리로 구성되고, 같은 크기의 배열 요소로 나누어지며,  
각 요소는 정수 색인과 연결되어 빠르게 접근할 수 있다.  
자바스크립트는 처음 배포 당시 배열을 포함시키지 못했다.  
실제로 성능 문제만 무시한다면 객체는 배열이 할 수 있는 모든 것을 할 수 있다.  
오늘날 자바스크립트의 배열은 예전과는 다르게, 네 가지 면에서 객체와 살짝 다르다.

- 배열의 length 속성은 배열의 요소의 개수를 의미하지는 않는다.  
  그 대신, 가장 큰 색인보다 1 큰 값을 나타낸다.  
  만약 배열에 네 개의 요소가 있고 마지막 요소의 색인이 10이라면 length는 11이다.  
  이는 자바스크립트의 배열이 진짜 배열인 것같은 환상을 불러일으킨다.
- 배열은 Object.prototype보다 좋은, Array.prototype을 상속한다.
- 배열은 객체 리터럴이 아닌 배열 리터럴을 사용해 만들어진다.  
  배열 리터럴은 문법적으로 훨씬 더 간단하다.  
  [] 안에 표현식이 하나도 없을 수도 있고, 하나 이상의 표현식이 ','로 구분되어 나열될 수도 있다.
- JSON은 배열과 객체를 다르게 취급하는 반면, 자바스크립트는 둘을 비슷하게 처리한다.

typeof 연산자는 배열에 대해 'object'를 반환한다.  
따라서 배열인지 확인하려면 `Array.isArray(value)`를 사용해야 한다.

## 배열의 원점

0에서 시작하는 것이 자바스크립트에 영향을 미치는 경우는 배열의 요소에 번호를 매길 때와 문자열의 문자들에 번호를 매길 때이다.  
배열을 다룰 때 한 번에 하나의 요소만 처리해야 한다는 생각은 최소한 포트란 시절까지 가야 맞는 말이다.  
최근에는 배열 요소를 한 번에 하나씩 처리하기보다, 배열을 좀 더 함수처럼 처리해야 한다는 생각이 더 지배적이다.  
그래야 명시적인 반복문 처리가 없어져서 코드가 단순해지고, 멀티프로세서에 작업을 분산해서 처리할 수 있는 능력이 생긴다.  
배열의 요소가 어떤 식으로 번호가 매겨지는지 신경 쓸 필요가 없긴 하지만,  
정수 색인 값이 어느 정도 커지면 원점이 무엇인지 확실히 해야 한다.

## 초기화

두 가지 방법으로 새로운 배열을 만들 수 있다.

- 배열 리터럴
- new Array(정수)

```javascript
let a = new Array(5).fill(0);
let b = [0, 0, 0, 0, 0];
a === b; //false
```

문자열과는 다르게, 하지만 다른 객체와 마찬가지로,  
배열은 실제로 같은 배열인 경우에만 같다고 본다.

## 스택과 큐

배열은 배열을 스택처럼 쓸 수 있게 만드는 메서드들을 가진다. (pop, push)  
스택은 인터프리터나 계산기에서 자주 사용된다.

shift 메서드는 0번째 요소를 제거하고 반환하며, unshift 메서드는 배열 가장 앞에 새로운 요소를 추가한다.  
shift와 unshift는 pop과 push에 비해 많이 느린데, 배열이 크면 특히 심하다.  
shift와 push를 써서 큐를 구현할 수 있다.

## 검색

indexOf 메서드는 인자로 전달받은 값과 동일한 요소의 색인 값을 반환한다.  
배열에 찾는 값이 없으면 -1을 반환한다.  
indexOf의 반환 값이 -1인지 검사하지 않고 사용하면, 그와 관련된 연산이 아무런 경고 없이 잘못될 수 있다.  
자바스크립트에는 대신 사용할 수 있는 빈 값(bottom value: 타입 시스템에서 null과 같이 아무 값도 가지지 않은 값)들이 있다.  
indexOf는 -1 대신 이런 빈 값들 중 하나를 반환해야만 할 것이다.

lastIndexOf 함수는 indexOf와 반대로 배열의 뒤쪽부터 검색한다.  
같은 값이 여러 개 있다면 가장 뒤쪽의 색인 값을 반환하는 것이다.

includes 함수는 값이 있으면 참을, 없으면 거짓을 반환한다.

## 축약

reduce 메서드는 배열을 하나의 값으로 축약한다.  
두 개의 매개변수를 받는 함수를 인자로 전달받아, 배열의 요소가 하나의 값이 될 때까지 전달받은 함수에 두 인자를 전달하여 게속 호출한다.

reduce 메서드는 두 가지 방식으로 설계할 수 있다.

- 전달한 함수를 배열의 모든 요소에 대해 호출하도록 한다.  
  이 경우 제대로 동작하기 위해서는 초기 값이 반드시 지정되어야 한다.  
  reduce에 곱셈 함수를 전달할 경우는 초기 값 1,  
  Math.max 함수를 전달할 경우는 초기 값 -Infinity로 해주면 된다.

```javascript
function add(reduction, element) {
  return reduction + element;
}

let array = [3, 5, 7, 11];
let total = array.reduce(add, 0); // 26
// (0, 3)
// (3, 5)
// (8, 7)
// (15, 11)
```

add 함수가 반환하는 값은 다음 add 함수 호출 때 reduction 인자로 전달된다.

- 초기 축약 값이 필요 없게끔 하려면 전달되는 함수가 한 번 덜 호출되면 된다.  
  전달된 함수가 처음 호출될 때 0번째와 1번째 요소를 인자로 받는다.  
  즉, 0번째 요소가 초기 축약 값이 되는 것이다.

```javascript
let total = array.reduce(add);
// (3, 5)
// (8, 7)
// (15, 11)
```

자바스크립트의 reduce 메서드는 두 방법으로 모두 동작할 수 있다.  
초기 축약 값을 전달하면 전달한 함수는 배열의 모든 요소마다 호출된다.  
전달하지 않으면 0번째 배열 요소가 초기 축약 값으로 사용된다.

reduceRight 함수는 배열의 끝에서 시작한다는 것을 제외하면 reduce와 똑같다.

## 반복

배열의 forEach 메서드는 함수를 인자로 받으며 배열의 모든 요소에 대해 전달된 함수를 호출한다.  
이 함수는 element, element_nr, array를 전달받는다.

- element : 현재 처리하고 있는 배열 요소
- element_nr : 해당 요소의 색인 값 (함께 처리해야 하는 다른 배열이 있을 때 유용)
- array : 이건 실수이다. array를 전달하는 것은 처리되는 동안 배열을 수정하기 위함인데, 해서는 안 된다.

forEach는 호출한 함수의 반환 값을 무시한다.  
반환 값에 조금 신경 쓰면 재미있는 메서드를 만들 수 있다.

- every  
  반환 값을 처리한다. 반환 값이 false이거나 false로 처리할 수 있는 값이면 처리를 멈추고 false를 반환한다.  
  true면 처리를 계속한다. 배열의 끝에 도달하면 true를 반환한다.
- some  
  every와 아주 비슷하다. 반환 값이 true거나 true로 처리할 수 있는 값이면 처리를 멈추고 true를 반환한다.  
  false면 처리를 계속한다. 배열의 끝에 도달하면 false를 반환한다.
- find  
  일치하는 처음 값을 반환한다.
- findIndex  
  일치하는 처음 값의 색인을 반환한다.
- filter  
  배열의 끝까지 처리하면서 반환 값이 true인 요소의 목록을 배열로 반환한다.
- map  
  인자로 전달된 함수의 모든 반환 값을 모아서 새로운 배열로 반환한다.  
  원래 배열을 개선하거나 확장하는 방식으로 변환해서 새로운 배열을 만드는 이상적인 메서드이다.

배열을 반대 방향으로 처리하는 메서드는 없다.  
reverse 메서드를 먼저 호출할 수도 있겠지만, reverse는 매우 파괴적이며 고정된 배열에는 사용할 수 없다.

## 정렬

자바스크립트의 sort 메서드에는 몇 가지 문제가 있다.  
sort는 추가 메모리 공간을 사용하지 않고 배열 자체를 수정한다. 그래서 동결된 배열은 정렬할 수 없다.  
그리고 공유 중인 배열을 정렬하는 것은 위험하다.

기본으로 사용하는 비교 함수는 값을 문자열로 간주해서 정렬한다.  
값이 실제로 숫자라도 문자열처럼 정렬한다.

```javascript
let arr = [11, 2, 23, 13, 3, 5, 17, 7, 29, 19];
arr.sort(); // [11, 13, 17, 19, 2, 23, 29, 3, 5, 7]
```

이는 sort에 비교 함수를 전달해서 바로잡을 수 있다.  
비교 함수에는 두 개의 요소가 인자로 전달되며,  
0번째 요소가 배열의 앞쪽에 와야 할 경우 음수를,  
1번째 요소가 앞쪽에 와야 할 경우 양수를,  
어느 쪽이 앞쪽으로 가야 할지 알 수 없을 경우 0을 반환해야 한다.

```javascript
// 배열의 모든 요소가 유한한 숫자일 경우 정확하게 정렬할 수 있다.
function compare(first, second) {
  return first - second;
}
```

또한 sort는 안정성이 부족하다.  
배열의 요소를 비교했을 때 같은 값, 즉 0을 반환하는 경우 두 요소의 상대적인 위치를 그래도 유지한다면 안정적이다.  
하지만 자바스크립트는 그렇지 않다. 이는 객체 배열이나 배열의 배열을 정렬할 때 문제가 될 수 있다.

우선 성으로 정렬하고 성이 같다면 이름을 기준으로 정렬하는 경우를 생각해 보자.  
한 가지 방법은 우선 이름을 기준으로 정렬하고 그 다음 성으로 다시 정렬하는 것이다.  
하지만 sort를 쓰면 성으로 정렬할 때 이름으로 정렬한 순서가 사라져서 사용할 수 없다.

이를 위한 팩토리 함수를 만들어 보자.

```javascript
function refine(collection, path) {
  /**
   * 배열, 객체, 문자열 배열 형태의 경로를 정달받아서 경로의 끝에 있는 값을 반환한다.
   * 값이 없으면 undefined를 반환한다.
   */
  return path.reduce((refinement, element) => {
    try {
      return refinement[element];
    } catch (ignore) {}
  }, collection);
}

/**
 * 팩토리 함수는 배열의 배열이나 객체 배열을 정렬할 때 필요한 비교 함수를 만들어 준다.
 * 인자는 하나 이상의 문자열이나 정수로, 이 값들은 비교할 때 사용할 속성이나 요소들을 지정한다.
 * 0번째 인자가 동일하면 1번째 인자를 가지고 비교하고, 1번째도 동일하면 3번째를 기준으로 비교하는 방식이다.
 */
function by(...keys) {
  // 각 키를 문자열 배열로 변환한다.
  const paths = keys.map((element) => {
    return element.toString().split(".");
  });

  // 일치하지 않는 값을 찾을 때까지 각 값을 비교한다.
  // 일치하지 않는 값이 없으면 두 값은 동일한 값이다.
  return function compare(first, second) {
    let first_value, second_value;
    if (
      paths.every((path) => {
        first_value = refine(first, path);
        second_value = refine(second, path);
        return first_value === second_value;
      })
    ) {
      return 0;
    }

    // 두 값이 서로 다른 자료형이라면 자료형의 이름을 비교하는 정책을 적용하자.
    // boolean < number < string < undefined
    return (
      typeof first_value === typeof second_value
        ? first_value > second_value
        : typeof first_value < typeof second_value
    )
      ? -1
      : 1;
  };
}
```

## 그 외의 내용

- concat : 두 개 이상의 배열을 연결해서 새로운 배열로 만든다.
- join : 문자열 배열과 구분자를 인자로 받아서, 이들을 합쳐서 하나의 큰 문자열로 만든다.  
  구분자가 필요 없다면 빈 문자열을 전달한다. (split 메서드의 반대)
- reverse : 배열의 요소들을 반대 방향으로 뒤집는다. soft 함수처럼 파괴적이어서 배열 자체를 바꾼다.
- slice : 배열 전체를 복사하거나 배열의 일부를 복사할 수 있다.  
  0번째 매개변수는 복사를 시작할 색인 값  
  1번째 매개변수는 0번째 매개변수에 복사할 요소의 숫자를 더한 값  
  1번째 매개변수를 생략하면 나머지 요소 전체를 복사한다.

## 순수함, 그리고 순수하지 않음

배열 메서드의 일부는 입력을 바꾸지 않는 순수함수이다.  
배열의 비순수 함수 중 일부는 반드시 순수 함수여야 했지만, 그러지 않았다.  
그래도 비순수 함수들 중 일부는 가치가 있는 함수이다.

- 순수 함수
  ```
  concat
  every
  filter
  find
  findIndex
  forEach
  indexOf
  join
  lastIndexOf
  map
  reduce
  recudeRight
  slice
  some
  ```
- 비순수 함수
  ```
  fill
  pop
  push
  shift
  splice
  unshift
  ```
- 순수 함수여야 했던 비순수 함수
  ```
  reverse
  sort
  ```
