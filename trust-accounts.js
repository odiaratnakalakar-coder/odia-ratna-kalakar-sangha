import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
  
  


console.log("Trust Accounts Loaded");

async function loadDashboard() {
  try {

    // Total Members
    const memberSnap = await getDocs(collection(db, "members"));
    document.getElementById("members").textContent = memberSnap.size;

    // Total Donation
    const donationSnap = await getDocs(collection(db, "donations"));
    let totalDonation = 0;

    donationSnap.forEach(doc => {
      totalDonation += Number(doc.data().amount || 0);
    });

    document.getElementById("donation").textContent =
"Docs: " + donationSnap.size + " | ₹" + totalDonation;

    // Total Expense
    const expenseSnap = await getDocs(collection(db, "expenses"));
    let totalExpense = 0;

    expenseSnap.forEach(doc => {
      totalExpense += Number(doc.data().amount || 0);
    });

    document.getElementById("totalExpense").textContent =
"Docs: " + expenseSnap.size + " | ₹" + totalExpense;

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

loadDashboard();
