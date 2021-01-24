import big_integer from "./big_integer";

// is_big_float 함수는 big float 객체인지 아닌지 알려 준다.
function is_big_float(big) {
  return (
    typeof big === "object" &&
    big_integer.is_big_integer(big.coefficient) &&
    Number.isSafeInteger(big.exponent)
  );
}
