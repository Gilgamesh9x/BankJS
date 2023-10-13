"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKJS

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: "Med Amine",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-05-27T17:01:17.194Z",
    "2023-10-01T23:36:17.929Z",
    "2023-10-03T12:01:20.894Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Bruce Girouard",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-07-16T14:43:26.374Z",
    "2020-07-28T18:49:59.371Z",
    "2023-10-03T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

/////////////////////////////////////////////////
// Functions

/// Compute User names and add them to the objects

function createComputedUserNames(accs) {
  accs.forEach((account) => {
    account.userName = account.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
}

createComputedUserNames(accounts);

/// Computer Balances and add them to the objects

function computeBalances(accs) {
  accs.forEach((account) => {
    account.balance = account.movements.reduce(
      (accumulator, amount) => accumulator + amount,
      0
    );
  });
}

computeBalances(accounts);

// CurrentAccount value

let currentAccount;

// Date and Time for current time

const now = new Date();

// Date and time for functions
function formatMovementDate(date, locale) {
  const daysPassed = Math.floor((new Date() - date.getTime()) / 86_400_000);

  if (daysPassed === 0) {
    return "Today";
  } else if (daysPassed === 1) {
    return "Yesterday";
  } else if (daysPassed <= 7) {
    return `${daysPassed} days ago`;
  } else {
    return new Intl.DateTimeFormat(locale).format(date);
  }
}

// CUrrency Formatting

function currencyFormatting(currency, locale, value) {
  const options_numbers = {
    style: "currency",
    currency: currency,
  };
  return new Intl.NumberFormat(locale, options_numbers).format(value);
}

// Display and upldate UI:

function updateUI(account) {
  DisplayBalanceandDate(account);
  displayMovements(account.movements, account.movementsDates, currentAccount);
  calcDisplaySummary(account);
}

/// Display the movements of the accounts
function displayMovements(movements, md, account) {
  containerMovements.innerHTML = "";
  movements.forEach((amount, index) => {
    // each movement and its date
    const movementDate = new Date(md[index]);
    const displayDate = formatMovementDate(movementDate, account.locale);
    const depostOrWithrawal = amount > 0 ? "deposit" : "withdrawal";
    const addMovement = `
    <div class="movements__row">
      <div class="movements__type movements__type--${depostOrWithrawal}">${
      index + 1
    } ${depostOrWithrawal}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${currencyFormatting(
        account.currency,
        account.locale,
        amount
      )}</div>
    </div>
    `;

    containerMovements.insertAdjacentHTML("afterbegin", addMovement); // if we do beforeend, it will start the indexes from the max index to the min one
  });
}

// Display balance:

function DisplayBalanceandDate(account) {
  labelBalance.textContent = `${currencyFormatting(
    account.currency,
    account.locale,
    account.balance
  )}`;

  const options = {
    hour: "numeric",
    minute: "numeric",
    day: "numeric",
    month: "long",
    weekday: "short",
  };
  const locale = navigator.language;
  labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(now); // we can passs only one argument if we want and not add any options, and also we can set the locale to what we want like: ("en-US")
}

// Display Countdown
function countDown(time) {
  interval = setInterval(() => {
    time.setSeconds(time.getSeconds() - 1);

    const options = {
      minute: "numeric",
      second: "numeric",
    };

    labelTimer.textContent = new Intl.DateTimeFormat("fr-FR", options).format(
      time
    );

    if (new Intl.DateTimeFormat("fr-FR", options).format(time) === "00:00") {
      containerApp.style.opacity = 0;
      labelWelcome.textContent = "Log in to get started";
      clearTimeout(interval);
    }
  }, 1000);
}

// Compute and display Summary

function calcDisplaySummary(account) {
  const valueIn = account.movements
    .filter((amount) => amount > 0)
    .reduce((acc, amount) => acc + amount, 0);
  const valueOut = account.movements
    .filter((amount) => amount < 0)
    .reduce((acc, amount) => acc + amount, 0);

  const interest = account.movements
    .filter((amount) => amount > 0)
    .map((amount) => (amount * account.interestRate) / 100)
    .filter((interest) => interest >= 1) // we will only add the interest if it's above 1 euro
    .reduce((acc, amount) => acc + amount, 0);

  labelSumIn.textContent = currencyFormatting(
    account.currency,
    account.locale,
    valueIn
  );
  labelSumOut.textContent = currencyFormatting(
    account.currency,
    account.locale,
    Math.abs(valueOut)
  );
  labelSumInterest.textContent = currencyFormatting(
    account.currency,
    account.locale,
    interest
  );
}

// countdown related
let interval;
// countdown related
function setTimeForCountDown() {
  if (interval) clearInterval(interval);
  let time = new Date();
  time.setMinutes(5);
  time.setSeconds(0);
  labelTimer.textContent = "05:00";
  countDown(time);
}

btnLogin.addEventListener("click", function (event) {
  // countdown related
  setTimeForCountDown();
  // countdown related

  // prevent form from submitting (prevent the refresh)
  event.preventDefault();
  // hold the values of the login in variables so we can check them later
  const userName = inputLoginUsername.value.toLowerCase();
  const pin = inputLoginPin.value;

  currentAccount = accounts.find(
    (account) => account.userName === userName && Number(pin) === account.pin
  );

  // if the userl logs in, display UI and a welcome message
  if (currentAccount) {
    containerApp.style.opacity = 1;
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }!`;
    // when we log in, we want to delete the values that were passed
    inputLoginUsername.value = inputLoginPin.value = ""; // since the = works from right to left
    // delete the focus on pin after loggining (when we click on enter)
    inputLoginPin.blur();
    // call the functions
    updateUI(currentAccount);
  } else {
    return console.log("User not found");
  }
});

// Transfer money

btnTransfer.addEventListener("click", function (event) {
  event.preventDefault();
  setTimeForCountDown();
  let transferToUser = inputTransferTo.value;
  let transferAmount = Number(inputTransferAmount.value);

  // let's find the account (the object) to which we will send the amount.
  const transferToAccount = accounts.find(
    (account) => account.userName === transferToUser
  );
  // Clear input fields and remove focus.
  inputTransferTo.value = inputTransferAmount.value = "";
  inputTransferAmount.blur();
  // check if the user exists and if the amount to transfer is available in the balance
  if (!transferToAccount) {
    console.log("Recipient account not found");
  } else if (transferToAccount === currentAccount) {
    console.log("You cannot transfer money to your own account");
  } else if (transferAmount >= currentAccount.balance && transferAmount <= 0) {
    console.log(
      "You do not have enough money or the amount you wanna send is equal or less than 0"
    );
  } else {
    // Subtract the amount sent from the balance and add it to movements.
    currentAccount.balance -= transferAmount;
    currentAccount.movements.push(-transferAmount);

    // Add the amount sent to the balance and add it to movements of the recipient.
    transferToAccount.balance += transferAmount;
    transferToAccount.movements.push(transferAmount);

    // Add date to each movement
    transferToAccount.movementsDates.push(new Date().toISOString());
    currentAccount.movementsDates.push(new Date().toISOString());

    // Display everything
    updateUI(currentAccount);
  }
});

// Request loan

btnLoan.addEventListener("click", function (event) {
  event.preventDefault();
  setTimeForCountDown();

  const amountToLoan = Math.floor(inputLoanAmount.value);

  // Clear input fields and remove focus.
  inputLoanAmount.value = "";
  inputLoanAmount.blur();

  if (
    amountToLoan > 0 &&
    currentAccount.movements.some((amount) => amount > amountToLoan * 0.1)
  ) {
    setTimeout(() => {
      currentAccount.balance += amountToLoan;
      currentAccount.movements.push(amountToLoan);
      // Add date to each movement
      currentAccount.movementsDates.push(new Date());
      updateUI(currentAccount);
      console.log("Loan Approved!");
    }, 3000);
    console.log("Waiting to approve the loan...");
  } else {
    console.log("You can't request a loan");
  }
});

// Close account

btnClose.addEventListener("click", function (event) {
  event.preventDefault();
  setTimeForCountDown();

  let closeMyAccount = inputCloseUsername.value;
  let closeMyAccountPin = Number(inputClosePin.value);

  // Clear input fields and remove focus.
  inputCloseUsername.value = inputClosePin.value = "";
  inputTransferAmount.blur();

  // Let's check if the credentials are correct
  if (
    closeMyAccount === currentAccount.userName &&
    closeMyAccountPin === currentAccount.pin
  ) {
    // let's find the index of the account we wanna delete
    const indexOfCurrentAccount = accounts.findIndex(
      (account) => account.userName === currentAccount.userName
    );
    // let's delete the account
    accounts.splice(indexOfCurrentAccount, 1);
    containerApp.style.opacity = 0;
    labelWelcome.textContent = "Log in to get started";
  } else {
    console.log("Your username or password are not correct");
  }
});

// Sort button

let sorted = false;

btnSort.addEventListener("click", function () {
  if (!sorted) {
    const copyMovementsSorted = currentAccount.movements
      .slice()
      .sort((a, b) => a - b); // the slice will create a copy
    displayMovements(
      copyMovementsSorted,
      currentAccount.movementsDates,
      currentAccount
    );
    sorted = true;
  } else {
    displayMovements(
      currentAccount.movements,
      currentAccount.movementsDates,
      currentAccount
    );
    sorted = false;
  }
});
