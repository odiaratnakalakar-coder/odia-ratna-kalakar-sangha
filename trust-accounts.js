import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

console.log("Trust Accounts Loaded");
async function loadDashboard() {

    // Total Members
    const memberSnap = await getDocs(collection(db, "members"));

    document.getElementById("members").textContent =
        memberSnap.size;

}

loadDashboard();
