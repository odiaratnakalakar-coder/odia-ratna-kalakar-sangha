import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc,
  query
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const incomeRef = collection(db, "income");
const trustRef = collection(db, "trust_accounts");

async function migrateIncomeToTrust() {
  const snapshot = await getDocs(query(incomeRef));

  console.log("Total Records:", snapshot.size);
    for (const docSnap of snapshot.docs) {

    const data = docSnap.data();

    await addDoc(trustRef, {
      date: data.paymentDate || "",
      type: "Membership",
      amount: Number(data.amount || 1200),
      description: data.purpose || "Membership Fee",
      paymentMode: data.paymentMode || "Cash",
      receiptNumber: data.receiptNo || "",
      collectedBy: data.collectedBy || "Admin",
      memberName: data.name || "",
      mobile: data.mobile || "",
      notes: "Migrated from income collection",
      createdAt: data.createdAt || new Date()
    });

    console.log("Migrated:", data.memberId);
    }
    alert("✅ Migration Completed Successfully!");
}

migrateIncomeToTrust()
  .then(() => console.log("Done"))
  .catch((err) => {
    console.error(err);
    alert("❌ Migration Error: " + err.message);
  });
