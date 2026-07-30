import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let members = [];
let selectedMember = null;

async function loadMembers() {
  try {
    const snap = await getDocs(collection(db, "members"));

    members = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log("Members Loaded:", members.length);

  } catch (err) {
    console.error(err);
    alert("Firestore Error: " + err.message);
  }
}

loadMembers();

document.getElementById("searchBtn").addEventListener("click", async () => {

  if (members.length === 0) {
    await loadMembers();
  }

  const keyword = document
    .getElementById("searchMember")
    .value
    .trim()
    .toLowerCase();

  selectedMember = members.find(m =>
    (m.name || "").toLowerCase().includes(keyword) ||
    (m.mobile || "").includes(keyword) ||
    (m.memberId || "").toLowerCase().includes(keyword)
  );

  if (!selectedMember) {
    alert("ସଦସ୍ୟ ମିଳିଲେ ନାହିଁ");
    return;
  }
    document.getElementById("memberPhoto").src =
    selectedMember.photoUrl || "images/default-user.png";

  document.getElementById("memberName").innerText =
    selectedMember.name || "";

  document.getElementById("memberId").innerText =
    "Member ID : " + (selectedMember.memberId || "");

  document.getElementById("memberMobile").innerText =
    "Mobile : " + (selectedMember.mobile || "");

  document.getElementById("memberStatus").innerText =
    selectedMember.paid ? "✅ Paid" : "❌ Pending";

  loadPaymentHistory(selectedMember.memberId);

});

document.getElementById("receivePayment").addEventListener("click", async () => {

  if (!selectedMember) {
    alert("ପ୍ରଥମେ ସଦସ୍ୟଙ୍କୁ Search କରନ୍ତୁ");
    return;
  }

  const amount = Number(document.getElementById("paymentAmount").value);
  const paymentDate = document.getElementById("paymentDate").value;
  const paymentMode = document.getElementById("paymentMode").value;

  if (!paymentDate) {
    alert("Payment Date ବାଛନ୍ତୁ");
    return;
  }

  const receiptNo = "ORKS-" + Date.now();

  await updateDoc(doc(db, "members", selectedMember.id), {
    paid: true,
    paymentAmount: amount,
    paymentDate: paymentDate,
    paymentMode: paymentMode,
    txId: receiptNo
  });
    await addDoc(collection(db, "transactions"), {
    memberId: selectedMember.memberId,
    name: selectedMember.name,
    mobile: selectedMember.mobile,
    amount: amount,
    paymentDate: paymentDate,
    paymentMode: paymentMode,
    receiptNo: receiptNo,
    type: "Membership Fee",
    createdAt: new Date()
  });

  alert("✅ Payment Successful\nReceipt No: " + receiptNo);

  await loadMembers();
  await loadPaymentHistory(selectedMember.memberId);

});

async function loadPaymentHistory(memberId) {

  const tbody = document.querySelector("#paymentHistoryTable tbody");
  tbody.innerHTML = "";

  const q = query(
    collection(db, "transactions"),
    where("memberId", "==", memberId)
  );

  const snap = await getDocs(q);

  snap.forEach((doc) => {

    const data = doc.data();

    tbody.innerHTML += `
      <tr>
        <td>${data.paymentDate || "-"}</td>
        <td>₹${data.amount || 0}</td>
        <td>${data.paymentMode || "-"}</td>
      </tr>
    `;

  });
}
