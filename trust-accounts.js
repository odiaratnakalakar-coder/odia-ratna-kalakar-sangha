// =====================================
// Trust Accounts V2
// Part 1
// Firebase Setup
// =====================================

import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firestore Collections

const membersRef = collection(db, "members");
const incomeRef = collection(db, "income");
const expensesRef = collection(db, "expenses");

// Dashboard Elements

const totalMembersEl = document.getElementById("totalMembers");
const memberIncomeEl = document.getElementById("memberIncome");
const totalDonationEl = document.getElementById("totalDonation");
const totalExpenseEl = document.getElementById("totalExpense");
const totalIncomeEl = document.getElementById("totalIncome");
const currentBalanceEl = document.getElementById("currentBalance");

// Member Fee

const MEMBER_FEE = 1200;

// Variables

let totalMembers = 0;
let memberIncome = 0;
let totalDonation = 0;
let totalExpense = 0;
// =====================================
// Part 2
// Dashboard Calculation
// =====================================

async function loadMembers() {

    const snap = await getDocs(membersRef);

    totalMembers = snap.size;

    memberIncome = totalMembers * MEMBER_FEE;

    totalMembersEl.textContent = totalMembers;

    memberIncomeEl.textContent =
        "₹" + memberIncome.toLocaleString("en-IN");

}

// Donation Total
function loadDonationTotal() {

    onSnapshot(incomeRef, (snapshot) => {

        totalDonation = 0;

        snapshot.forEach((doc) => {

            const data = doc.data();

            // କେବଳ Donation କୁ ଗଣନା କର
            if (data.type === "Donation") {
                totalDonation += Number(data.amount || 0);
            }

        });

        updateDashboard();

    });

}

// Expense Total
function loadExpenseTotal() {

    onSnapshot(expensesRef, (snapshot) => {

        totalExpense = 0;

        snapshot.forEach((doc) => {

            totalExpense += Number(doc.data().amount || 0);

        });

        updateDashboard();

    });

}

// Dashboard Update
function updateDashboard() {

    const totalIncome = memberIncome + totalDonation;

    const balance = totalIncome - totalExpense;

    totalDonationEl.textContent =
        "₹" + totalDonation.toLocaleString("en-IN");

    totalExpenseEl.textContent =
        "₹" + totalExpense.toLocaleString("en-IN");

    totalIncomeEl.textContent =
        "₹" + totalIncome.toLocaleString("en-IN");

    currentBalanceEl.textContent =
        "₹" + balance.toLocaleString("en-IN");

}

// Start
async function init() {

    await loadMembers();

    loadDonationTotal();

    loadExpenseTotal();

}

init();
