// ===============================
// Trust Accounts JS - Part 1
// ===============================

import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firestore Collection
const incomeRef = collection(db, "income");

// Load Transactions
async function loadTransactions() {

  const tbody = document.getElementById("transactionBody");

  if (!tbody) return;

  tbody.innerHTML = "";

  const snapshot = await getDocs(
    query(incomeRef, orderBy("createdAt", "desc"))
  );

  let income = 0;
  let expense = 0;
  let donation = 0;
    snapshot.forEach((doc) => {

    const data = doc.data();

    income += Number(data.amount || 0);

    tbody.innerHTML += `
      <tr>
        <td>${data.createdAt?.toDate
          ? data.createdAt.toDate().toLocaleDateString()
          : "-"}</td>

        <td>${data.purpose || "Membership"}</td>

        <td>${data.memberId || "-"}</td>

        <td>₹${data.amount || 0}</td>

        <td>${data.paymentMode || "-"}</td>

        <td>${data.receiptNo || "-"}</td>

        <td>Paid</td>
      </tr>
    `;

  });

  document.getElementById("totalIncome").textContent = "₹" + income;
  document.getElementById("totalExpense").textContent = "₹" + expense;
  document.getElementById("totalDonation").textContent = "₹" + donation;
  document.getElementById("currentBalance").textContent =
    "₹" + (income + donation - expense);
  }

// First Load
loadTransactions();
