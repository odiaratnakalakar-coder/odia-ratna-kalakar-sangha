import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const memberList = document.getElementById("memberList");

async function loadPendingMembers() {

  memberList.innerHTML = "<h3>Loading...</h3>";

  const snapshot = await getDocs(collection(db, "members"));

  memberList.innerHTML = "";

  snapshot.forEach((docSnap) => {

    const member = {
      id: docSnap.id,
      ...docSnap.data()
    };

    if (member.paid === true) return;
        memberList.innerHTML += `
      <div class="member-card">

        <img src="${member.photoUrl || 'images/default-user.png'}">

        <h3>${member.name}</h3>

        <p><b>Mobile:</b> ${member.mobile}</p>

        <p><b>Address:</b> ${member.address}</p>

        <p><b>Payment:</b> Pending</p>

        <div class="actions">

          <button
            class="approve"
            onclick="approveMember('${member.id}')">
            ✅ Approve
          </button>

          <button
            class="reject"
            onclick="rejectMember('${member.id}')">
            ❌ Reject
          </button>

        </div>

      </div>
    `;
      });

}

loadPendingMembers();

window.approveMember = function(id){
  alert("Approve Function ପରବର୍ତ୍ତୀ Step ରେ ଯୋଡ଼ିବା");
};

window.rejectMember = function(id){
  alert("Reject Function ପରବର୍ତ୍ତୀ Step ରେ ଯୋଡ଼ିବା");
};
