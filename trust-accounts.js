import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

console.log("Trust Accounts Loaded");
async function loadDashboard() {

    // Total Members
    const memberSnap = await getDocs(collection(db, "members"));

    document.getElementById("members").textContent =
        memberSnap.size;

}

loadDashboard();
