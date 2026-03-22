document.addEventListener("DOMContentLoaded", () => {
  const display = document.querySelector(".display");
  const numberButtons = document.querySelectorAll(".number");
  const operatorButtons = document.querySelectorAll(".operator");
  const clearButton = document.querySelector(".clear");
  const equalsButton = document.querySelector(".equals");

  let currentInput = "0";
  let previousInput = "";
  let operator = null;
  let shouldResetDisplay = false;

  function updateDisplay() {
    display.value = currentInput;
  }

  function clear() {
    currentInput = "0";
    previousInput = "";
    operator = null;
    shouldResetDisplay = false;
    updateDisplay();
  }

  function appendNumber(number) {
    if (shouldResetDisplay) {
      currentInput = number;
      shouldResetDisplay = false;
    } else if (currentInput === "0" && number !== ".") {
      currentInput = number;
    } else if (number === "." && currentInput.includes(".")) {
      return;
    } else {
      currentInput += number;
    }
    updateDisplay();
  }

  function chooseOperator(selectedOperator) {
    if (currentInput === "") return;
    if (previousInput !== "") {
      calculate();
    }
    operator = selectedOperator;
    previousInput = currentInput;
    shouldResetDisplay = true;
  }

  function calculate() {
    let result;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    if (isNaN(prev) || isNaN(current)) return;

    switch (operator) {
      case "+":
        result = prev + current;
        break;
      case "-":
        result = prev - current;
        break;
      case "*":
        result = prev * current;
        break;
      case "/":
        result = prev / current;
        break;
      default:
        return;
    }
    currentInput = result.toString();
    operator = null;
    previousInput = "";
    shouldResetDisplay = true;
    updateDisplay();
  }

  numberButtons.forEach((button) => {
    button.addEventListener("click", () => appendNumber(button.textContent));
  });

  operatorButtons.forEach((button) => {
    button.addEventListener("click", () =>
      chooseOperator(button.dataset.operator),
    );
  });

  equalsButton.addEventListener("click", () => {
    calculate();
  });

  clearButton.addEventListener("click", () => {
    clear();
  });

  updateDisplay(); // Initialize display
});
