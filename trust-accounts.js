// ===============================
// Trust Accounts V2
// Part 3A
// Firebase Imports & Variables
// ===============================

import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===============================
// Collections
// ===============================

const membersRef = collection(db, "members");
const donationsRef = collection(db, "income");
const expensesRef = collection(db, "expenses");
const settingsRef = doc(db, "system", "trust");

// ===============================
// Settings
// ===============================

let memberFee = 1200;

let totalMembers = 0;
let memberIncome = 0;

let totalDonation = 0;
let totalExpense = 0;
let currentBalance = 0;

// ===============================
// Dashboard Elements
// ===============================

const totalMembersEl =
document.getElementById("totalMembers");

const memberIncomeEl =
document.getElementById("memberIncome");

const totalDonationEl =
document.getElementById("totalDonation");

const totalExpenseEl =
document.getElementById("totalExpense");

const totalIncomeEl =
document.getElementById("totalIncome");

const currentBalanceEl =
document.getElementById("currentBalance");

// ===============================
// Form
// ===============================

const transactionForm =
document.getElementById("transactionForm");

// ===============================
// Transaction Container
// ===============================

const transactionCards =
document.getElementById("transactionCards");

// ===============================
// Search
// ===============================

const searchInput =
document.getElementById("searchInput");

const filterType =
document.getElementById("filterType");

// ===============================
// Monthly Report
// ===============================

const reportMonth =
document.getElementById("reportMonth");

const monthlyReportBtn =
document.getElementById("monthlyReportBtn");

// ===============================
// Print
// ===============================

const printBtn =
document.getElementById("printBtn");

const printMonthlyBtn =
document.getElementById("printMonthlyBtn");

// ===============================
// Edit
// ===============================

let editingId = null;
let editingCollection = null;

// ===============================
// App Start
// ===============================

init();
// ===============================
// PART 3B
// Dashboard Auto Calculation
// ===============================

// Load Member Fee Setting
async function loadSettings() {

    try {

        const snap = await getDoc(settingsRef);

        if (snap.exists()) {
            memberFee = snap.data().memberFee || 1200;
        }

    } catch (e) {

        console.error(e);

    }

}

// Load Members
async function loadMembers() {

    const snap = await getDocs(membersRef);

    totalMembers = snap.size;

    memberIncome = totalMembers * memberFee;

    totalMembersEl.textContent = totalMembers;

    memberIncomeEl.textContent =
        "₹" + memberIncome.toLocaleString("en-IN");

}

// Donation Total
function listenDonationTotal() {

    onSnapshot(donationsRef, (snap) => {

        totalDonation = 0;

        snap.forEach(doc => {

            totalDonation += Number(doc.data().amount || 0);

        });

        updateDashboard();

    });

}

// Expense Total
function listenExpenseTotal() {

    onSnapshot(expensesRef, (snap) => {

        totalExpense = 0;

        snap.forEach(doc => {

            totalExpense += Number(doc.data().amount || 0);

        });

        updateDashboard();

    });

}

// Dashboard Update
function updateDashboard() {

    const totalIncome =
        memberIncome + totalDonation;

    currentBalance =
        totalIncome - totalExpense;

    totalDonationEl.textContent =
        "₹" + totalDonation.toLocaleString("en-IN");

    totalExpenseEl.textContent =
        "₹" + totalExpense.toLocaleString("en-IN");

    totalIncomeEl.textContent =
        "₹" + totalIncome.toLocaleString("en-IN");

    currentBalanceEl.textContent =
        "₹" + currentBalance.toLocaleString("en-IN");

}

// Start Dashboard
async function startDashboard() {

    await loadSettings();

    await loadMembers();

    listenDonationTotal();

    listenExpenseTotal();

}

startDashboard();
async function init() {

    console.log("Trust Accounts Started");

    await startDashboard();

}
// ===============================
// PART 3C-1
// Save Transaction
// ===============================

transactionForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const type = document.getElementById("type").value;
    const amount = Number(document.getElementById("amount").value);
    const description = document.getElementById("description").value;
    const memberName = document.getElementById("memberName").value;
    const mobile = document.getElementById("mobile").value;
    const paymentMode = document.getElementById("paymentMode").value;
    const receiptNumber = document.getElementById("receiptNumber").value;
    const collectedBy = document.getElementById("collectedBy").value;
    const notes = document.getElementById("notes").value;
    const date = document.getElementById("date").value;

    const data = {
        date,
        amount,
        description,
        memberName,
        mobile,
        paymentMode,
        receiptNumber,
        collectedBy,
        notes,
        createdAt: serverTimestamp()
    };

    try {

        if (type === "Donation") {

            await addDoc(donationsRef, data);

        } else if (type === "Expense") {

            await addDoc(expensesRef, data);

        }

        alert("Transaction Saved Successfully");

        transactionForm.reset();

    } catch (err) {

        console.error(err);

        alert("Save Failed");

    }

});


    
