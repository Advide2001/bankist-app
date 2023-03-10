'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2021-11-28T18:49:59.371Z',
    '2022-12-25T14:43:26.374Z',
    '2022-12-28T18:49:59.371Z',
    '2022-12-30T12:01:20.894Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2022-12-25T14:43:26.374Z',
    '2022-12-28T18:49:59.371Z',
    '2022-12-30T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const DATE = new Date();

const createUserNames = function (accounts) {
  accounts.forEach(function (user) {
    user.username = user.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUserNames(accounts);

// Calculate diplay information

const formatMovementDates = transactionDate => {
  const calcDaysPassed = (date1, date2) => {
    const diffArray = [0, 0, 0]; // years passed, months passed, days passed
    diffArray[2] = Math.abs(date1.getDate() - date2.getDate());
    diffArray[1] = Math.abs(date1.getMonth() - date2.getMonth());
    diffArray[0] = Math.abs(date1.getFullYear() - date2.getFullYear());
    return diffArray;
  };

  const diffArray = calcDaysPassed(DATE, transactionDate);
  let dateDisplayStr = '';

  if (diffArray[0] == 0 && diffArray[1] == 0 && diffArray[2] == 0) {
    dateDisplayStr = 'Today';
  } else if (diffArray[0] == 0 && diffArray[1] == 0 && diffArray[2] == 1) {
    dateDisplayStr = 'Yesterday';
  } else if (diffArray[0] == 0 && diffArray[1] == 0 && diffArray[2] > 1) {
    dateDisplayStr = `${diffArray[2]} days ago`;
  } else if (diffArray[0] == 0 && diffArray[1] > 0) {
    dateDisplayStr = `${diffArray[1]} months ago`;
  } else if (diffArray[0] > 0) {
    dateDisplayStr = `${diffArray[0]} years ago`;
  }
  return dateDisplayStr;
};

const displayMovements = function (account, sort = false) {
  const sortedMovements = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  sortedMovements.forEach(function (movement, index) {
    const transactionType = movement > 0 ? 'deposit' : 'withdrawal';

    const displayDateStr = formatMovementDates(
      new Date(account.movementsDates[index])
    );

    const transactionDisplayRow = `
    <div class="movements__row">
      <div class="movements__type movements__type--${transactionType}">
      ${index + 1} ${transactionType}
      </div>
      <div class="movements__date">${displayDateStr}</div>
      <div class="movements__value"> $ ${movement}</div>
    </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', transactionDisplayRow);
  });
};

const updateUI = function (currentAccount) {
  // Calculate all account related information
  calcGlobalBalaance(currentAccount);
  displayMovements(currentAccount);
  calcDisplaySummary(currentAccount);
};

const calcGlobalBalaance = function (account) {
  const globalBalance = account.movements.reduce(
    (accumalator, movement) => accumalator + movement
  );
  account.balance = globalBalance;
  labelBalance.textContent = `${Math.round(globalBalance)} USD`;
};

const calcDisplaySummary = function (account) {
  const incomes = account.movements
    .filter(movement => movement > 0)
    .reduce((accumulator, movement) => accumulator + movement, 0);

  const expenditures = account.movements
    .filter(movement => movement < 0)
    .reduce((accumulator, movement) => accumulator + movement, 0);

  labelSumIn.textContent = `$${Math.round(incomes)}`;
  labelSumOut.textContent = `$${Math.round(expenditures)}`;
};

// Event handlers
let currentAccount, timer;

const now = new Date();
const day = `${now.getDay()}`.padStart(2, 0);
const month = `${now.getMonth() + 1}`.padStart(2, 0);
const year = now.getFullYear();
const hour = now.getHours();
const minute = `${now.getMinutes()}`.padStart(2, 0);
labelDate.textContent = `${day}/${month}/${year}, ${hour}:${minute}`;

const logoutTimer = () => {
  const tick = () => {
    const mins = String(Math.trunc(time / 60)).padStart(2, 0);
    const secs = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${mins}:${secs}`;
    // when time == 0, we should log out the user
    if (time === 0) {
      clearInterval(logoutTimer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
    }
    time--; // Remove one second
  };
  let time = 300;
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

btnLogin.addEventListener('click', e => {
  e.preventDefault();

  currentAccount = accounts.find(
    account => account.username === inputLoginUsername.value
  );
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    updateUI(currentAccount);

    // Change the opacity, to display the account info
    containerApp.style.opacity = 1;
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    // set logout timer
    if (timer) clearInterval(timer);
    timer = logoutTimer();
  } else {
    console.log('Invalid PIN or Username');
  }
});

btnTransfer.addEventListener('click', e => {
  e.preventDefault();
  const transferAmount = Number(inputTransferAmount.value);
  const beneficiaryAccount = accounts.find(
    account => account.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';
  if (
    transferAmount > 0 &&
    beneficiaryAccount &&
    transferAmount <= currentAccount.balance &&
    beneficiaryAccount?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-1 * transferAmount);
    beneficiaryAccount.movements.push(transferAmount);
    currentAccount.movementsDates.push(new Date().toISOString());
    beneficiaryAccount.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);
    if (timer) clearInterval(timer);
    timer = logoutTimer();
  } else {
    console.log('Transfer failed');
  }
});

btnClose.addEventListener('click', e => {
  e.preventDefault();
  const inputUsername = inputCloseUsername.value;
  const inputPin = inputClosePin.value;

  if (
    inputUsername === currentAccount.username &&
    Number(inputPin) === currentAccount.pin
  ) {
    const accountIndex = accounts.findIndex(
      account => account.username === currentAccount.username
    );
    accounts.splice(accountIndex, 1);
    containerApp.style.opacity = 0;
    inputCloseUsername.value = inputClosePin.value = '';
  } else {
    console.log('Credentials are invalid');
  }
});

btnLoan.addEventListener('click', e => {
  e.preventDefault();
  const requestedAmount = Number(inputLoanAmount.value);
  if (
    requestedAmount > 0 &&
    currentAccount.movements.some(movement => movement >= 0.1 * requestedAmount)
  ) {
    console.log(
      'Your loan request is being processed, funds will be credited to your account'
    );
    setTimeout(() => {
      // Add movement to account
      currentAccount.movements.push(requestedAmount);
      currentAccount.movementsDates.push(new Date().toISOString());
      // Update UI
      updateUI(currentAccount);
    }, 3000);

    if (timer) clearInterval(timer);
    timer = logoutTimer();
  } else {
    console.log('You are not eligible for a loan of this amount');
  }
  inputLoanAmount.value = '';
});

let sorted = false;

btnSort.addEventListener('click', e => {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
