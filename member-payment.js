import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let members = [];
let selectedMember = null;

// Load all members
async function loadMembers() {

  try {

    const snapshot = await getDocs(collection(db, "members"));

    members = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    console.log("Members Loaded:", members.length);

  } catch (err) {

    console.error(err);
    alert("Firestore Error: " + err.message);

  }

}

// Load members on page start
loadMembers();

// Search button
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
    alert("❌ ସଦସ୍ୟ ମିଳିଲେ ନାହିଁ");
    return;
  }
    // Show member details
  document.getElementById("memberPhoto").src =
    selectedMember.photoUrl || "images/default-user.png";

  document.getElementById("memberName").textContent =
    selectedMember.name || "";

  document.getElementById("memberId").textContent =
    "Member ID : " + (selectedMember.memberId || "");

  document.getElementById("memberMobile").textContent =
    "Mobile : " + (selectedMember.mobile || "");

  document.getElementById("memberStatus").textContent =
    selectedMember.paid ? "✅ Paid" : "❌ Pending";

  await loadPaymentHistory(selectedMember.memberId);

});

// Receive Payment
document.getElementById("receivePayment").addEventListener("click", async () => {

  if (!selectedMember) {
    alert("ପ୍ରଥମେ ସଦସ୍ୟଙ୍କୁ Search କରନ୍ତୁ");
    return;
  }
if (selectedMember.paid) {
  alert("⚠️ ଏହି ସଦସ୍ୟ ପୂର୍ବରୁ Payment କରିସାରିଛନ୍ତି");
  return;
}
  const amount = Number(document.getElementById("paymentAmount").value);

  const paymentDate = document.getElementById("paymentDate").value;

  const paymentMode = document.getElementById("paymentMode").value;

  if (!paymentDate) {
    alert("ପେମେଣ୍ଟ ତାରିଖ ବାଛନ୍ତୁ");
    return;
  }

  const receiptNo = "ORKS-" + Date.now();
    await updateDoc(doc(db, "members", selectedMember.id), {
    paid: true,
    paymentAmount: amount,
    paymentDate: paymentDate,
    paymentMode: paymentMode,
    receiptNo: receiptNo
  });

  await addDoc(collection(db, "transactions"), {
    memberId: selectedMember.memberId,
    name: selectedMember.name,
    mobile: selectedMember.mobile,
    amount: amount,
    paymentDate: paymentDate,
    paymentMode: paymentMode,
    receiptNo: receiptNo,
    createdAt: new Date()
  });

  selectedMember.paid = true;

  document.getElementById("memberStatus").textContent = "✅ Paid";

  alert("✅ Payment Successful");

  await loadPaymentHistory(selectedMember.memberId);

});
// Payment History
async function loadPaymentHistory(memberId) {

  const tbody = document.querySelector("#paymentHistoryTable tbody");
  tbody.innerHTML = "";

  try {

    const q = query(
      collection(db, "transactions"),
      where("memberId", "==", memberId)
    );

    const snapshot = await getDocs(q);

    snapshot.forEach((docSnap) => {

      const data = docSnap.data();

      const row = `
        <tr>
          <td>${data.paymentDate || "-"}</td>
          <td>₹${data.amount || 0}</td>
          <td>${data.paymentMode || "-"}</td>
        </tr>
      `;

      tbody.insertAdjacentHTML("beforeend", row);

    });

  } catch (err) {

    console.error("Payment History:", err);
    alert("Payment History Error: " + err.message);

  }

}

// Default payment date = today
document.getElementById("paymentDate").value =
  new Date().toISOString().split("T")[0];
