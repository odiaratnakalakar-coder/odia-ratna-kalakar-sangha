import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
  
  
  
  
  
  
  

  
  
  
  

  
  

  
  


console.log("Trust Accounts Loaded");
console.log("Trust Accounts Loaded");

let editId = null;
let editCollection = null;

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

  document.getElementById("donation").textContent = "₹" + totalDonation;  


    // Total Expense
    const expenseSnap = await getDocs(collection(db, "expenses"));
    let totalExpense = 0;

    expenseSnap.forEach(doc => {
      totalExpense += Number(doc.data().amount || 0);
    });

    document.getElementById("totalExpense").textContent = "₹" + totalExpense;
// Membership Income
let membershipIncome = 0;

memberSnap.forEach(doc => {
    const data = doc.data();

    console.log(data);

    if (data.paid === true) {
        membershipIncome += Number(data.paymentAmount || 1200);
    }
});
  // Paid & Unpaid Members
let paidMembers = 0;
let unpaidMembers = 0;

memberSnap.forEach(doc => {
  const data = doc.data();

  if (data.paid === true) {
    paidMembers++;
  } else {
    unpaidMembers++;
  }
});




  
  
    
  
document.getElementById("paidMembers").textContent = paidMembers;
document.getElementById("unpaidMembers").textContent = unpaidMembers;
const totalIncome = membershipIncome;



    




document.getElementById("totalIncome").textContent = "₹" + totalIncome;

// Current Balance
const balance = totalIncome + totalDonation - totalExpense;

document.getElementById("balance").textContent = "₹" + balance;
    const today = new Date().toLocaleDateString();

let todayEntry = 0;

const incomeSnap = await getDocs(collection(db, "income"));

incomeSnap.forEach(doc => {
  const data = doc.data();

  if (data.date === new Date().toISOString().split("T")[0]) {
    todayEntry++;
  }
});

const expenseSnap2 = await getDocs(collection(db, "expenses"));

expenseSnap2.forEach(doc => {
  const data = doc.data();

  if (data.date === new Date().toISOString().split("T")[0]) {
    todayEntry++;
  }
});
  


    
    
  
    
  


document.getElementById("todayEntry").textContent = todayEntry;

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

loadDashboard();
// Load Transaction History
async function loadTransactions() {

  const table = document.getElementById("transactionTable");
  table.innerHTML = "";

  let sl = 1;
// Members Membership Fee
const memberSnap = await getDocs(collection(db, "members"));

memberSnap.forEach(doc => {
    const data = doc.data();

    if (data.paid === true) {

        table.innerHTML += `
        <tr>
            <td>${sl++}</td>
            <td>${data.createdAt ?
                new Date(data.createdAt.seconds * 1000).toLocaleDateString()
                : "-"}</td>
            <td>Income</td>
            <td>Membership Fee</td>
            <td>₹${data.paymentAmount || 1200}</td>
            <td>${data.paymentMode || "Online"}</td>
            <td>
                ${data.name || "-"}<br>
                <small>${data.memberId || "-"}</small><br>
                <small>${data.txnId || "-"}</small>
            </td>
            <td>-</td>
        </tr>
        `;
    }
});
  // Donations
  const donationSnap = await getDocs(collection(db, "donations"));

  donationSnap.forEach(doc => {

    const data = doc.data();

    table.innerHTML += `
      <tr>
        <td>${sl++}</td>
        <td>${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : "-"}</td>
        <td>Income</td>
        <td>Donation</td>
        <td>₹${data.amount || 0}</td>
        <td>-</td>
        <td>${data.name || "-"}</td>
        <td>
  <button onclick="editTransaction('donations','${doc.id}','${data.amount || 0}','${data.purpose || ""}','${data.name || ""}')">
    Edit
  </button>
  <button onclick="deleteTransaction('donations','${doc.id}')">
    Delete
  </button>
</td>




      </tr>
    `;
  });

  // Expenses
  const expenseSnap = await getDocs(collection(db, "expenses"));

  expenseSnap.forEach(doc => {

    const data = doc.data();

    table.innerHTML += `
      <tr>
        <td>${sl++}</td>
        <td>${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : "-"}</td>
        <td>Expense</td>
        <td>${data.purpose || "-"}</td>
        <td>₹${data.amount || 0}</td>
        <td>-</td>
        <td>${data.note || "-"}</td>
        <td>
  <button onclick="editTransaction('expenses','${doc.id}','${data.amount || 0}','${data.purpose || ""}','${data.note || ""}')">
    Edit
  </button>

  <button onclick="deleteTransaction('expenses','${doc.id}')">
    Delete
  </button>
</td>




      </tr>
    `;
  });

}

loadTransactions();
document.getElementById("transactionForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const amount = Number(document.getElementById("amount").value);
  const description = document.getElementById("description").value;
  const payment = document.getElementById("payment").value;
  const by = document.getElementById("by").value;
const date = document.getElementById("date").value;
  const data = {
  amount,
  date,
  createdAt: serverTimestamp()
};
    
  
  

  try {

  if (editId) {

    await updateDoc(doc(db, editCollection, editId), {
      amount: amount,
      purpose: description || category,
      name: by,
      note: by
    });

    alert("Transaction Updated Successfully");

    editId = null;
    editCollection = null;

    document.getElementById("transactionForm").reset();

    loadDashboard();
    loadTransactions();

    return;
  }

  if (type === "Income") {

    

      await addDoc(collection(db, "income"), {
    ...data,
    name: by,
    purpose: description || category,
    paymentMode: payment,
    collectedBy: by
});
        
        
      
      

    } else {

      await addDoc(collection(db, "expenses"), {
        ...data,
        note: by,
        purpose: description || category
      });

    }

    alert("Transaction Saved Successfully");

    document.getElementById("transactionForm").reset();

    loadDashboard();
    loadTransactions();

  } catch (err) {
    alert(err.message);
  }

});
async function deleteTransaction(collectionName, id) {

  if (!confirm("ଏହି Transaction କୁ Delete କରିବେ?")) return;

  try {
    await deleteDoc(doc(db, collectionName, id));

    alert("Transaction Deleted Successfully");

    loadDashboard();
    loadTransactions();

  } catch (error) {
    alert(error.message);
  }
}

window.deleteTransaction = deleteTransaction;
function editTransaction(collectionName, id, amount, description, by) {

  editCollection = collectionName;
  editId = id;

  document.getElementById("amount").value = amount;
  document.getElementById("description").value = description;
  document.getElementById("by").value = by;

 document.getElementById("type").disabled = true;

alert("Edit Mode Enabled. Update the data and click Save Transaction."); 
}

window.editTransaction = editTransaction;
