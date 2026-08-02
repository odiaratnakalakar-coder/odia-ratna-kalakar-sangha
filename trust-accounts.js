// ===============================
// Trust Accounts JS - Part 1
// ===============================

import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
  
  
  


// Firestore Collection
const accountsRef = collection(db, "trust_accounts");

// Form
const form = document.getElementById("transactionForm");

// Save Transaction
form.addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

        const transaction = {

            date: document.getElementById("date").value,

            type: document.getElementById("type").value,

            amount: Number(document.getElementById("amount").value),

            description: document.getElementById("description").value,

            paymentMode: document.getElementById("paymentMode").value,

            receiptNumber: document.getElementById("receiptNumber").value,

            collectedBy: document.getElementById("collectedBy").value,

            memberName: document.getElementById("memberName").value,

            mobile: document.getElementById("mobile").value,

            notes: document.getElementById("notes").value,

            createdAt: serverTimestamp()

        };

        await addDoc(accountsRef, transaction);
await loadTransactions();
        alert("✅ Transaction Saved Successfully");

        form.reset();

    } catch (error) {

        console.error(error);

        alert("❌ " + error.message);

    }

});
// ===============================
// Load Transactions
// ===============================

// ===============================
// Load Transactions (Card View)
// ===============================

async function loadTransactions() {

    const container = document.getElementById("transactionCards");

    container.innerHTML = "";

    const q = query(accountsRef, orderBy("createdAt", "desc"));

    const snapshot = await getDocs(q);

    let income = 0;
    let expense = 0;
    let donation = 0;

    if (snapshot.empty) {

        container.innerHTML = `
        <div class="empty-card">
            No Transactions Found
        </div>`;

        return;
    }

    

// First Load
loadTransactions();
