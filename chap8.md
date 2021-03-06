# 객체

자바스크립트는 객체라는 단어를 오버로드한다. 자바스크립트는 null과 undefined를 제외한 모든 것을 객체로 취급한다.  
객체는 자바스크립트의 기본 데이터 구조이다. 객체는 속성들을 가지며 각 속성에는 이름과 값이 있다.  
이름은 문자열이고 값은 어떤 자료형이든 될 수 있다.  
다른 언어에서는 일너 객체를 해시 테이블, 맵, 구조체, 딕셔너리 등으로 부른다.

객체 리터럴을 사용해서 새로운 객체를 만들 수 있다.  
객체 리터럴은 변수나 객체, 배열, 함수 파라미터, 함수 리턴 값이 될수 있는 값을 만든다.  
객체 리터럴의 범위는 {}로 결정되며, 중괄호 안에 속성들을 나열할 수 있다.  
객체의 속성은 `.`또는 `[]`로 접근할 수 있다.

객체에게 찾을 수 없는 속성 값을 요청하면 undefined를 반환한다.  
객체에는 undefined를 저장하지 않는 것이 좋다. 허용되긴 하지만, 헷갈릴 수 있으므로 피하는 것이 좋다.

할당문을 통해 객체에 새로운 속성을 추가할 수 있다. 이미 있는 값이라면 개로운 값으로 바뀐다.  
속성을 제거하려면 delete 연산자를 사용해야 한다.  
typeof 연산자는 객체애 대해 'object'를 반환한다.

## 대소문자

속성을 찾을 때 쓰는 키 값은 대소문자를 구별한다.

## 복사

Object.assign 함수로 객체의 속성들을 다른 객체로 복사할 수 있다.  
객체를 복사하고 싶다면 빈 객체에 대입하면 된다.

## 상속

자바스크립트에서 객체는 다른 객체를 상속받을 수 있다.  
하지만 클래스와 같이 코드와 아주 강하게 결합된 구조를 제공하는 다른 언어들의 상속과는 다르다.  
자바스크립트의 상속은 데이터만 연결되므로 애플리케이션 구조를 취약하게 만들 가능성을 줄여 준다.

Object.create(prototype)은 이미 있는 객체를 전달받아서 이를 상속받는 새로운 객체를 반환한다.  
즉, 기존의 객체가 새로운 객체의 prototype이 되는 것이다.  
모든 객체는 프로토타입이 될 수 있으며 프로토타입을 상속받은 객체 역시 다른 새로운 객체의 프로토타입이 될 수 있다.  
프로토타입 체인의 길이에 제한은 없지만 짧은 것이 좋다.

객체에 없는 속성을 참조하면, 해당 객체의 프로토타입을 확인하고, 프로토타입의 프로토타입을 확인하는 식으로 거실러 올라간다.  
프로토타입 체인 중에 같은 이름의 속성을 발견하면, 이를 반환한다.

객체의 속성에 값을 대입하면 가장 새로운 객체만 변경된다. 다른 객체는 변경되지 않는다.  
프로토타입을 쓰는 주된 용도 중 하나는 함수를 저장하는 공간으로 사용하는 것이다.  
객체가 객체 리터럴로 만들어지면, 그 객체는 Object.prototype을 상속받는다.  
배열은 Array.prototype을, 숫자는 Number.prototype을, 함수는 Function.prototype을 상속받는다.

상속이 있으므로 속성에는 고유 속성과 상속받은 속성이 있다.  
대부분의 경우 두 속성은 똑같이 동작하지만, 고유 속성인지를 알아야 하는 경우가 있다.  
hasOwnProperty(string) 함수가 있긴 하지만, 만약 해당 이름의 속성을 가지고 있으면 객체의 속성이 함수로 호출될 수 있으므로 믿을 만하지 않다.

JSON.stringify를 써서 객체를 문자열로 반환해서 쉽게 확인할 수 있다.

Object.assign(Object.create({}), prototype)보다 Object.create(prototype)이 메모리를 덜 쓴다.

의도치 않은 상속으로 생기는 문제도 있다. 해시 테이블처럼 쓰기 위해 만든 객체가 'toString'과 같은 종속적인 속성들을 상속받을 수도 있다.  
이럴 경우에는 Object.create(null)을 써서 객체가 아무것도 상속받지 않게 만들 수 있다.

## 키

Object.keys(object) 함수는 상속받은 속성을 제외한 객체의 나머지 모든 속성의 이름을 문자열의 배열로 반환한다.  
이 배열을 써서 객체의 속성을 배열 메서드로 처리할 수 있다.

## 동결

Object.freeze(object) 함수는 객체를 전달받아서 동결한다. 즉, 변경할 수 없게 만든다.  
깊은 동결은 아니다. 오직 최상위 객체만 동결되고 프로토타입 체인의 다른 객체는 동결되지 않는다.

불변성은 시스템을 더 신뢰할 수 있게 해주며, 보안 면에서 훌륭한 인터페이스를 갖춘 좋은 객체를 만들 수 있다.

Object.freeze는 값에 적용되는 반면, const는 변수에 적용된다.  
const에 객체를 저장해도 그 객체는 수정 가능하다. 다른 객체를 저장할 수 없을 뿐이다.  
일반 변수에 불변 객체를 지정하면 객체를 변경할 수 없을 뿐, 변수에 다른 값ㅇ르 저장할 수는 있다.

## 프로토타입과 동결을 같이 쓰지 마세요

프로토타입은 객체의 간단한 복사본을 만들 때 사용된다.  
만약 한 가지 속성만 바꾸고 나머지 속성은 모든 동일한 또 다른 객체를 만들려면, 객체가 동결되어 있다면 Object.create로는 불가능하다.  
다른 함수형 프로그래밍에서는, 동결된 프로토타입을 상속받아서 인스턴스를 만들고, 인스턴스를 변경한 다음, 인스턴스를 동결하면 될 것이다.  
하지만 자바스크립트에서는 불가능하다. 인스턴스를 수정하면 예외가 발생한다. 그리고 새로운 속성을 추가하는 것이 느리게 동작한다.  
새로운 속성을 추가할 때마다 모든 프로토타입 체인을 뒤져서 해당 이름의 속성을 불변으로 지정한 경우가 있는지 검사해야 한다.

## WeakMap

자바스크립트 설계의 잘못된 점 중 하나는 객체의 속성 이름이 반드시 문자열이어야 한다는 것이다.  
키 객체를 사용하게 되면 키 객체를 toString 메서드를 통해 키 문자열로 반환해 버린다.

WeakMap은 문자열을 제외한 다른 객체를 키로 쓴다.  
Object와 WeakMap의 문법은 아예 다르다.

WeakMap은 객체에 비밀스럽게 보관되어야 할 속성을 추가하고자 할 때 유용하다.  
객체와 비밀 키 둘 다 가지고 있어야 접근이 가능하게 만들 수 있다.

```javascript
const secret_key = new WeakMap();
secret_key.set(object, secret);

secret = secret_key.get(object);
```

이 방법은 동결된 객체에도 비밀스러운 속성을 추가할 수 있다.

유용한 코드를 객체에 제공하는 한편, 그 코드들이 객체의 메서드를 호출하거나 수정하는 것은 막고 싶은 경우에도 유용하다.  
봉인자(sealer)라는 것이 있는데, 봉인자에 객체를 전달하면 열 수 없는 상자를 반환한다.  
원래 객체로 복구하려면 일치하는 개봉자(unsealer)에 이 상자를 전달해야 한다.

```javascript
function sealer_factory() {
  const weakmap = new WeakMap();
  return {
    sealer(object) {
      const box = Object.freeze(Object.create(null));
      weakmap.set(box, object);
      return box;
    },
    unsealer(box) {
      return weakmap.get(box);
    },
  };
}
```

WeakMap은 그 내용에 대한 검사를 허용하지 않는다. 키를 가지고 있지 않는 한, 값을 볼 수 없다.  
이는 자바스크립트의 가비지 컬렉터와 잘 맞다.  
존재하는 키의 사본이 더 이상 없다면, 해당 키의 속성은 자동으로 삭제된다. 메모리 누수를 막을 수 있는 것이다.

자바스크립트는 이와 비슷한 Map도 가지고 있지만, 보안 기능이나 메모리 누출 방지 기능이 없다. (배열의 map 메서드 아님)

자바스크립트에는 WeakMap이 할 수 있는 것 중 단 한 가지 기능만 제공하는 Symbol이라는 것도 있다. 하지만 별로 필요가 없는 기능이다.
