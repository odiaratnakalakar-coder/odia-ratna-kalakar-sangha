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
const donationsRef = collection(db, "donations");
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

    onSnapshot(donationsRef, (snapshot) => {

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
// =====================================
// Part 3
// Save Transaction
// =====================================

const transactionForm = document.getElementById("transactionForm");

transactionForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const type = document.getElementById("type").value;
    const amount = Number(document.getElementById("amount").value);

    const data = {
        date: document.getElementById("date").value,
        amount: amount,
        description: document.getElementById("description").value,
        memberName: document.getElementById("memberName").value,
        mobile: document.getElementById("mobile").value,
        paymentMode: document.getElementById("paymentMode").value,
        receiptNumber: document.getElementById("receiptNumber").value,
        collectedBy: document.getElementById("collectedBy").value,
        notes: document.getElementById("notes").value,
        type: type,
        createdAt: serverTimestamp()
    };

    try {

        if (type === "Donation") {

            await addDoc(donationsRef, data);

        } else if (type === "Expense") {

            await addDoc(expensesRef, data);

        } else if (type === "Membership") {

            await addDoc(donationsRef, data);

        }

        alert("✅ Transaction Saved");

        transactionForm.reset();

    } catch (err) {

        console.error(err);

        alert("❌ Save Failed");

    }

});
// =====================================
// Part 4A
// Monthly Report
// =====================================

const reportMonth = document.getElementById("reportMonth");
const monthlyReportBtn = document.getElementById("monthlyReportBtn");

const monthlyMemberIncome = document.getElementById("monthlyMemberIncome");
const monthlyDonation = document.getElementById("monthlyDonation");
const monthlyExpense = document.getElementById("monthlyExpense");
const monthlyBalance = document.getElementById("monthlyBalance");

monthlyReportBtn.addEventListener("click", async () => {

    const month = reportMonth.value;

    if (!month) {
        alert("Please select month");
        return;
    }

    let donation = 0;
    let expense = 0;

    const incomeSnap = await getDocs(donationsRef);

    incomeSnap.forEach((doc) => {

        const data = doc.data();

        if (data.date && data.date.startsWith(month)) {

        totalDonation += Number(data.amount || 0);
              
            

        }

    });

    const expenseSnap = await getDocs(expensesRef);

    expenseSnap.forEach((doc) => {

        const data = doc.data();

        if (data.date && data.date.startsWith(month)) {

            expense += Number(data.amount || 0);

        }

    });

    const memberIncomeMonth = totalMembers * MEMBER_FEE;

    monthlyMemberIncome.textContent =
        "₹" + memberIncomeMonth.toLocaleString("en-IN");

    monthlyDonation.textContent =
        "₹" + donation.toLocaleString("en-IN");

    monthlyExpense.textContent =
        "₹" + expense.toLocaleString("en-IN");

    monthlyBalance.textContent =
        "₹" + (memberIncomeMonth + donation - expense).toLocaleString("en-IN");

});
