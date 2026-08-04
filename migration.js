import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function migratePaidMembers() {

  const snap = await getDocs(collection(db, "members"));

  for (const d of snap.docs) {

    const m = d.data();

    if (m.paid === true) {

      await addDoc(collection(db, "income"), {
        memberId: m.memberId || "",
        name: m.name || "",
        mobile: m.mobile || "",
        amount: 1200,
        type: "Membership",
        purpose: "Old Membership Fee",
        paymentMode: "Cash",
        receiptNo: "OLD-" + (m.memberId || Date.now()),
        collectedBy: "Migration",
        createdAt: serverTimestamp()
      });

      console.log("Added:", m.name);
    }
  }

  alert("✅ Migration Completed");
}

migratePaidMembers();
