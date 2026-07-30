import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let members = [];
window.selectedMember = null;

async function loadMembers() {

    let snap;

    try {

        snap = await getDocs(collection(db, "members"));

    } catch (e) {

        alert("Firestore Error: " + e.message);
        return;

    }

    members = [];

    snap.forEach((d) => {

        members.push({
            id: d.id,
            ...d.data()
        });

    });

    console.log("Members Loaded:", members.length);

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

    const member = members.find(m =>

        (m.name || "").toLowerCase().includes(keyword) ||
        (m.mobile || "").includes(keyword) ||
        (m.memberId || "").toLowerCase().includes(keyword)

    );

    if (!member) {

        alert("ସଦସ୍ୟ ମିଳିଲେ ନାହିଁ");
        return;

    }

    window.selectedMember = member;
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

    await loadPaymentHistory(member.memberId);

});

document.getElementById("receivePayment").addEventListener("click", async () => {

    if (!window.selectedMember) {
        alert("ପ୍ରଥମେ ସଦସ୍ୟଙ୍କୁ Search କରନ୍ତୁ");
        return;
    }

    const amount = Number(document.getElementById("paymentAmount").value);
    const paymentDate = document.getElementById("paymentDate").value;
    const paymentMode = document.getElementById("paymentMode").value;

    const receiptNo = "ORKS-" + Date.now();

    await updateDoc(doc(db, "members", window.selectedMember.id), {
        paid: true,
        paymentAmount: amount,
        paymentDate: paymentDate,
        paymentMode: paymentMode,
        txId: receiptNo
    });

    await addDoc(collection(db, "transactions"), {
        memberId:
          async function loadPaymentHistory(memberId) {

    const tbody = document.querySelector("#paymentHistoryTable tbody");
    tbody.innerHTML = "";

    try {

        const snap = await getDocs(collection(db, "transactions"));

        snap.forEach((d) => {

            const data = d.data();

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

    } catch (e) {

        console.error(e);
        alert("Payment History Error: " + e.message);

    }

          }
