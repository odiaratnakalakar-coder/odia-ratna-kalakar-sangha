import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const memberList = document.getElementById("memberList");


/* ================================================= */
/* LOAD PENDING MEMBERS */
/* ================================================= */

async function loadPendingMembers() {

  memberList.innerHTML = "<h3>Loading...</h3>";

  try {

    const snapshot =
      await getDocs(
        collection(db, "members")
      );

    memberList.innerHTML = "";

    let pendingFound = false;

    snapshot.forEach((docSnap) => {

      const member = {
        id: docSnap.id,
        ...docSnap.data()
      };


      /* APPROVED / PAID MEMBER SKIP */

      if (member.paid === true) return;


      pendingFound = true;


      memberList.innerHTML += `

        <div class="member-card">

          <img
            src="${member.photoUrl || 'images/default-user.png'}"
            onerror="this.src='images/default-user.png'"
          >

          <h3>
            ${escapeHTML(member.name || "Member")}
          </h3>

          <p>
            <b>Mobile:</b>
            ${escapeHTML(member.mobile || "-")}
          </p>

          <p>
            <b>Address:</b>
            ${escapeHTML(member.address || "-")}
          </p>

          <p>
            <b>Payment:</b>
            Pending
          </p>


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


    if (!pendingFound) {

      memberList.innerHTML = `

        <div style="
          text-align:center;
          padding:20px;
          color:#aaa;
        ">

          🎉 ବର୍ତ୍ତମାନ କୌଣସି Pending Member ନାହାନ୍ତି।

        </div>

      `;

    }

  }
  catch (error) {

    console.error(
      "Pending Members Error:",
      error
    );

    memberList.innerHTML = `

      <div style="
        color:#ff6666;
        text-align:center;
        padding:20px;
      ">

        ❌ Member load ହୋଇପାରିଲା ନାହିଁ।

      </div>

    `;

  }

}


/* ================================================= */
/* GET NEXT MEMBER ID */
/* ================================================= */

async function getNextMemberId() {

  const counterRef =
    doc(
      db,
      "system",
      "counter"
    );


  const counterSnap =
    await getDoc(counterRef);


  let number = 1;


  if (counterSnap.exists()) {

    number =
      Number(
        counterSnap.data().lastNumber || 0
      ) + 1;

  }


  await setDoc(
    counterRef,
    {
      lastNumber: number
    }
  );


  return (
    "ORKS" +
    String(number).padStart(4, "0")
  );

}


/* ================================================= */
/* APPROVE MEMBER */
/* ================================================= */

window.approveMember =
async function(id) {

  try {

    const memberRef =
      doc(
        db,
        "members",
        id
      );


    const memberSnap =
      await getDoc(memberRef);


    if (!memberSnap.exists()) {

      alert(
        "❌ Member ମିଳିଲା ନାହିଁ"
      );

      return;

    }


    /* MEMBER DATA */

    const member =
      memberSnap.data();


    const memberName =
      member.name || "Member";


    const mobile =
      String(
        member.mobile || ""
      ).replace(
        /\D/g,
        ""
      );


    if (!mobile) {

      alert(
        "⚠️ ଏହି Member ଙ୍କ Mobile Number ମିଳିଲା ନାହିଁ।"
      );

      return;

    }


    /* MEMBER ID */

    const memberId =
      await getNextMemberId();


    /* RECEIPT ID */

    const txnId =
      "RCPT-" +
      Date.now();


    /* ================================================= */
    /* UPDATE MEMBER */
    /* ================================================= */

    await updateDoc(
      memberRef,
      {

        memberId:
          memberId,

        status:
          "approved",

        paid:
          true,

        txnId:
          txnId

      }
    );


    /* ================================================= */
    /* INCOME ENTRY */
    /* ================================================= */

    await addDoc(
      collection(
        db,
        "income"
      ),
      {

        memberId:
          memberId,

        name:
          memberName,

        mobile:
          member.mobile || "",

        amount:
          1200,

        purpose:
          "New Membership Fee",

        paymentMode:
          "Online",

        receiptNo:
          txnId,

        collectedBy:
          "Admin",

        createdAt:
          new Date()

      }
    );


    /* ================================================= */
    /* SUCCESS MESSAGE */
    /* ================================================= */

    alert(
      "✅ Member Approved Successfully\n\n" +
      "Member ID: " +
      memberId
    );


    /* ================================================= */
    /* WHATSAPP MESSAGE */
/* ================================================= */

    const message = `ନମସ୍କାର 🙏

🌺 ଜୟ ଜଗନ୍ନାଥ 🚩

ପ୍ରିୟ ${memberName},

ଆପଣଙ୍କ ସଦସ୍ୟ ପଞ୍ଜୀକରଣ ସଫଳତାର ସହିତ ଅନୁମୋଦିତ ହୋଇଛି। 

ଆପଣ ବର୍ତ୍ତମାନ “ଓଡ଼ିଆ ରତ୍ନ କଳାକାର ସଂଘ, ସୁରତ”ର ଜଣେ ସ୍ୱୀକୃତ ସଦସ୍ୟ।

ଆପଣଙ୍କ ସଦସ୍ୟ ID: ${memberId}

ସଂଘ ପକ୍ଷରୁ ଆପଣଙ୍କୁ ହାର୍ଦ୍ଦିକ ସ୍ୱାଗତ। 🙏🌹

ଆମର ଲକ୍ଷ୍ୟ — ଏକତା, ସେବା ଓ ଓଡ଼ିଆ ସଂସ୍କୃତିର ସୁରକ୍ଷା। 🤝

ଆପଣଙ୍କ ସହଯୋଗ  ଆମ ସଂଘକୁ ଆହୁରି ମଜବୁତ କରିବ।

ଜୟ ଜଗନ୍ନାଥ 🚩🙏

ଧନ୍ୟବାଦ।
ଓଡ଼ିଆ ରତ୍ନ କଳାକାର ସଂଘ, ସୁରତ`;


    /* ================================================= */
    /* WHATSAPP NUMBER */
    /* ================================================= */

    let whatsappNumber =
      mobile;


    /*
      ଯଦି number 10 digit ହୁଏ
      India country code +91 ଯୋଡ଼ିବ
    */

    if (
      whatsappNumber.length === 10
    ) {

      whatsappNumber =
        "91" +
        whatsappNumber;

    }


    /* ================================================= */
    /* WHATSAPP URL */
    /* ================================================= */

    const whatsappURL =
      "https://wa.me/" +
      whatsappNumber +
      "?text=" +
      encodeURIComponent(
        message
      );


    /* ================================================= */
    /* OPEN WHATSAPP? */
    /* ================================================= */

    const openWhatsApp =
      confirm(
        "📱 WhatsApp Message ପଠାଇବେ?\n\n" +
        "Member: " +
        memberName
      );


    if (openWhatsApp) {

      window.location.href =
        whatsappURL;

    }


    /* RELOAD */

    loadPendingMembers();

  }
  catch (error) {

    console.error(
      "Approve Error:",
      error
    );


    alert(
      "❌ Approval failed:\n" +
      error.message
    );

  }

};


/* ================================================= */
/* REJECT MEMBER */
/* ================================================= */

window.rejectMember =
async function(id) {

  try {

    const ok =
      confirm(
        "ଏହି Pending Member କୁ Delete କରିବେ?"
      );


    if (!ok) return;


    await deleteDoc(
      doc(
        db,
        "members",
        id
      )
    );


    alert(
      "❌ Member Rejected Successfully"
    );


    loadPendingMembers();

  }
  catch (error) {

    console.error(
      "Reject Error:",
      error
    );


    alert(
      "❌ Reject failed:\n" +
      error.message
    );

  }

};


/* ================================================= */
/* ESCAPE HTML */
/* ================================================= */

function escapeHTML(value) {

  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


/* ================================================= */
/* START */
/* ================================================= */

loadPendingMembers();


console.log(
  "✅ Pending Members + WhatsApp System Loaded"
);
