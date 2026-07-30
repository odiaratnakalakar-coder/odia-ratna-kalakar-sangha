import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let members = [];

async function loadMembers() {
    const snap = await getDocs(collection(db, "members"));

    members = [];

    snap.forEach(doc => {
        members.push({
            id: doc.id,
            ...doc.data()
        });
    });
}
console.log(members);
loadMembers();
document.getElementById("searchBtn").addEventListener("click", () => {

    const keyword = document.getElementById("searchMember").value.trim().toLowerCase();

    const member = members.find(m =>
        (m.name || "").toLowerCase().includes(keyword) ||
        (m.mobile || "").includes(keyword) ||
        (m.memberId || "").toLowerCase().includes(keyword)
    );

    if (!member) {
        alert("ସଦସ୍ୟ ମିଳିଲେ ନାହିଁ");
        return;
    }

    document.getElementById("memberPhoto").src =
        member.photoUrl || "images/default-user.png";

    document.getElementById("memberName").innerText =
        member.name || "";

    document.getElementById("memberId").innerText =
        "Member ID : " + (member.memberId || "");

    document.getElementById("memberMobile").innerText =
        "Mobile : " + (member.mobile || "");

    document.getElementById("memberStatus").innerText =
        member.paid ? "✅ Paid" : "❌ Pending";

    window.selectedMember = member;
loadPaymentHistory(member.memberId);
});
import {
  doc,
  updateDoc,
  addDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.getElementById("receivePayment").addEventListener("click", async () => {

    if (!window.selectedMember) {
        alert("ପ୍ରଥମେ ସଦସ୍ୟଙ୍କୁ Search କରନ୍ତୁ");
        return;
    }

    const amount = Number(document.getElementById("paymentAmount").value);
    const paymentDate = document.getElementById("paymentDate").value;
    const paymentMode = document.getElementById("paymentMode").value;

    const receiptNo = "ORKS-" + Date.now();

    // Update member
    await updateDoc(doc(db, "members", window.selectedMember.id), {
        paid: true,
        paymentAmount: amount,
        paymentDate: paymentDate,
        paymentMode: paymentMode,
        txId: receiptNo
    });

    // Save transaction
    await addDoc(collection(db, "transactions"), {
        memberId: window.selectedMember.memberId,
        name: window.selectedMember.name,
        amount: amount,
        paymentDate: paymentDate,
        paymentMode: paymentMode,
        receiptNo: receiptNo,
        type: "Membership Fee",
        createdAt: new Date()
    });

    alert("✅ Payment Successful\nReceipt No: " + receiptNo);

    loadMembers();
});
async function loadPaymentHistory(memberId) {

    const tbody = document.querySelector("#paymentHistoryTable tbody");
    tbody.innerHTML = "";

    const snap = await getDocs(collection(db, "transactions"));

    snap.forEach(doc => {

        const data = doc.data();

        if (data.memberId === memberId) {

            tbody.innerHTML += `
                <tr>
                    <td>${data.paymentDate || "-"}</td>
                    <td>₹${data.amount || 0}</td>
                    <td>${data.paymentMode || "-"}</td>
                </tr>
            `;

        }

    });

}
