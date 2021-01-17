# 큰 부동소수점

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

```