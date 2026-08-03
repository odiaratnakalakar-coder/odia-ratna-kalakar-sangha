// ===============================
// Trust Accounts JS
// ===============================

import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const incomeRef = collection(db, "income");

async function loadTransactions() {

  const container = document.getElementById("transactionCards");

  container.innerHTML = "";

  const snapshot = await getDocs(
    query(incomeRef, orderBy("createdAt", "desc"))
  );

  let income = 0;
  let expense = 0;
  let donation = 0;
    snapshot.forEach((doc) => {

    const data = doc.data();

    income += Number(data.amount || 0);

    container.innerHTML += `
      <div class="transaction-card">
        <h3>${data.purpose || "Membership Fee"}</h3>

        <p><b>Member:</b> ${data.name || "-"}</p>

        <p><b>Member ID:</b> ${data.memberId || "-"}</p>

        <p><b>Amount:</b> ₹${data.amount || 0}</p>

        <p><b>Payment Mode:</b> ${data.paymentMode || "-"}</p>

        <p><b>Receipt No:</b> ${data.receiptNo || "-"}</p>

        <p><b>Date:</b>
          ${
            data.createdAt?.toDate
              ? data.createdAt.toDate().toLocaleDateString()
              : "-"
          }
        </p>
      </div>
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
