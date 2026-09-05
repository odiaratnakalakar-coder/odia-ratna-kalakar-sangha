import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    runTransaction
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const memberList =
    document.getElementById("memberList");


/* =====================================================
   LOAD ONLY PENDING MEMBERS
===================================================== */

async function loadPendingMembers(){

    memberList.innerHTML = `
        <h3 style="
            text-align:center;
            color:#aaa;
            padding:20px;
        ">
            ⏳ Loading...
        </h3>
    `;

    try{

        const snapshot =
            await getDocs(
                collection(db,"members")
            );

        memberList.innerHTML = "";

        let pendingFound = false;

        snapshot.forEach(docSnap => {

            const member = {
                id: docSnap.id,
                ...docSnap.data()
            };


            const status =
                String(member.status || "")
                .trim()
                .toLowerCase();


            /* =============================================
               ONLY TRUE PENDING MEMBERS
            ============================================= */

            if(status !== "pending"){
                return;
            }


            /* =============================================
               APPROVED MEMBER NEVER COMES HERE
            ============================================= */

            if(member.approved === true){
                return;
            }


            if(
                String(member.approval || "")
                .trim()
                .toLowerCase() === "approved"
            ){
                return;
            }


            pendingFound = true;


            /* =========================================
               MEMBER CARD
            ========================================= */

            const card =
                document.createElement("div");

            card.className =
                "member-card";


            /* =========================================
               PHOTO
            ========================================= */

            const photo =
                document.createElement("img");

            photo.src =
                member.photoUrl ||
                "images/default-user.png";

            photo.alt =
                member.name || "Member";

            photo.onerror = function(){

                this.onerror = null;

                this.src =
                    "images/default-user.png";

            };

            card.appendChild(photo);


            /* =========================================
               NAME
            ========================================= */

            const name =
                document.createElement("h3");

            name.textContent =
                member.name || "Member";

            card.appendChild(name);


            /* =========================================
               MEMBER ID
            ========================================= */

            const memberId =
                document.createElement("p");

            memberId.innerHTML =
                "<b>Member ID:</b> " +
                escapeHTML(
                    member.memberId || "-"
                );

            card.appendChild(memberId);


            /* =========================================
               MOBILE
            ========================================= */

            const mobile =
                document.createElement("p");

            mobile.innerHTML =
                "<b>Mobile:</b> " +
                escapeHTML(
                    member.mobile || "-"
                );

            card.appendChild(mobile);


            /* =========================================
               ADDRESS
            ========================================= */

            const address =
                document.createElement("p");

            address.innerHTML =
                "<b>Address:</b> " +
                escapeHTML(
                    member.address || "-"
                );

            card.appendChild(address);


            /* =========================================
               PAYMENT
            ========================================= */

            const payment =
                document.createElement("p");

            payment.innerHTML = `
                <b>Payment:</b>
                <span style="color:#ffcc00;">
                    ⏳ Pending
                </span>
            `;

            card.appendChild(payment);


            /* =========================================
               APPROVAL
            ========================================= */

            const approval =
                document.createElement("p");

            approval.innerHTML = `
                <b>Approval:</b>
                <span style="color:#ffcc00;">
                    ⏳ Pending
                </span>
            `;

            card.appendChild(approval);


            /* =========================================
               ACTIONS
            ========================================= */

            const actions =
                document.createElement("div");

            actions.className =
                "actions";


            /* =========================================
               APPROVE BUTTON
            ========================================= */

            const approveButton =
                document.createElement("button");

            approveButton.className =
                "approve";

            approveButton.type =
                "button";

            approveButton.textContent =
                "✅ Approve";


            approveButton.addEventListener(
                "click",
                () => {

                    approveMember(
                        member.id
                    );

                }
            );


            /* =========================================
               REJECT BUTTON
            ========================================= */

            const rejectButton =
                document.createElement("button");

            rejectButton.className =
                "reject";

            rejectButton.type =
                "button";

            rejectButton.textContent =
                "❌ Reject";


            rejectButton.addEventListener(
                "click",
                () => {

                    rejectMember(
                        member.id
                    );

                }
            );


            actions.appendChild(
                approveButton
            );

            actions.appendChild(
                rejectButton
            );

            card.appendChild(
                actions
            );

            memberList.appendChild(
                card
            );

        });


        /* =============================================
           NO PENDING MEMBER
        ============================================= */

        if(!pendingFound){

            memberList.innerHTML = `
                <div style="
                    text-align:center;
                    padding:30px;
                    color:#aaa;
                    font-size:17px;
                ">
                    🎉 ବର୍ତ୍ତମାନ କୌଣସି
                    Pending Member ନାହାନ୍ତି।
                </div>
            `;

        }

    }
    catch(error){

        console.error(
            "Pending Members Error:",
            error
        );

        memberList.innerHTML = `
            <div style="
                color:#ff6666;
                text-align:center;
                padding:25px;
            ">
                ❌ Member load
                ହୋଇପାରିଲା ନାହିଁ।

                <br><br>

                ${escapeHTML(error.message)}
            </div>
        `;

    }

}


/* =====================================================
   GET NEXT MEMBER ID
===================================================== */

async function getNextMemberId(){

    const counterRef =
        doc(
            db,
            "system",
            "counter"
        );


    return await runTransaction(
        db,
        async(transaction) => {

            const counterSnap =
                await transaction.get(
                    counterRef
                );


            let number = 1;


            if(counterSnap.exists()){

                number =
                    Number(
                        counterSnap.data().lastNumber || 0
                    ) + 1;

            }


            transaction.set(
                counterRef,
                {
                    lastNumber:number
                }
            );


            return (
                "ORKS" +
                String(number).padStart(4,"0")
            );

        }
    );

}


/* =====================================================
   APPROVE MEMBER
===================================================== */

async function approveMember(id){

    try{

        const memberRef =
            doc(
                db,
                "members",
                id
            );


        const memberSnap =
            await getDoc(
                memberRef
            );


        if(!memberSnap.exists()){

            alert(
                "❌ Member ମିଳିଲା ନାହିଁ।"
            );

            return;

        }


        const member =
            memberSnap.data();


        /* =============================================
           MUST BE PENDING
        ============================================= */

        const status =
            String(member.status || "")
            .trim()
            .toLowerCase();


        if(status !== "pending"){

            alert(
                "⚠️ ଏହି Member Pending ରେ ନାହାନ୍ତି।"
            );

            await loadPendingMembers();

            return;

        }


        /* =============================================
           CONFIRM APPROVAL
        ============================================= */

        const ok =
            confirm(
                "ଏହି Member କୁ Approve କରିବେ?\n\n" +
                "Name: " +
                (member.name || "Member")
            );


        if(!ok){
            return;
        }


        /* =============================================
           CREATE MEMBER ID ONLY NOW
        ============================================= */

        const memberId =
            await getNextMemberId();


        /* =============================================
           RECEIPT ID
        ============================================= */

        const txnId =
            "RCPT-" + Date.now();


        /* =============================================
           APPROVE ONLY THIS MEMBER

           IMPORTANT:
           paid FIELD CHANGE କରାଯାଉନାହିଁ।

           ପୁରୁଣା paid value ଯାହା ଅଛି
           ସେହି value ହିଁ ରହିବ।
        ============================================= */

        await updateDoc(
            memberRef,
            {

                memberId:
                    memberId,

                status:
                    "approved",

                approved:
                    true,

                approval:
                    "approved",

                txnId:
                    txnId

            }
        );


        /* =============================================
           SUCCESS ALERT

           କେବଳ MESSAGE ରେ Successful
           ଦେଖାଯିବ।

           Firebase paid FIELD ରେ
           କୌଣସି ପରିବର୍ତ୍ତନ ନାହିଁ।
        ============================================= */

        alert(
            "✅ Member Approved Successfully\n\n" +
            "Name: " +
            (member.name || "Member") +
            "\n\nMember ID: " +
            memberId +
            "\n\n💳 Payment Status: Successful ✅"
        );


        /* =============================================
           WHATSAPP
        ============================================= */

        const mobile =
            String(
                member.mobile || ""
            ).replace(
                /\D/g,
                ""
            );


        if(mobile){

            let whatsappNumber =
                mobile;


            /* =========================================
               INDIA MOBILE NUMBER
            ========================================= */

            if(
                whatsappNumber.length === 10
            ){

                whatsappNumber =
                    "91" +
                    whatsappNumber;

            }


            /* =========================================
               WHATSAPP MESSAGE
            ========================================= */

            const message =
`ନମସ୍କାର 🙏

🌺 ଜୟ ଜଗନ୍ନାଥ 🚩

ପ୍ରିୟ ${member.name || "Member"},

ଆପଣଙ୍କ ସଦସ୍ୟ ପଞ୍ଜୀକରଣ Admin ଦ୍ୱାରା Approved ହୋଇଛି।

ଆପଣଙ୍କ ସଦସ୍ୟ ID: ${memberId}

💳 Payment Status: Successful ✅

ସଂଘ ପକ୍ଷରୁ ଆପଣଙ୍କୁ ହାର୍ଦ୍ଦିକ ସ୍ୱାଗତ। 🙏🌹

ଜୟ ଜଗନ୍ନାଥ 🚩🙏

ଧନ୍ୟବାଦ।
ଓଡ଼ିଆ ରତ୍ନ କଳାକାର ସଂଘ, ସୁରତ`;


            /* =========================================
               WHATSAPP URL
            ========================================= */

            const whatsappURL =
                "https://wa.me/" +
                whatsappNumber +
                "?text=" +
                encodeURIComponent(
                    message
                );


            /* =========================================
               ASK BEFORE WHATSAPP
            ========================================= */

            const send =
                confirm(
                    "📱 WhatsApp Message ପଠାଇବେ?"
                );


            if(send){

                window.location.href =
                    whatsappURL;

                return;

            }

        }


        /* =============================================
           RELOAD LIST
        ============================================= */

        await loadPendingMembers();

    }
    catch(error){

        console.error(
            "Approve Error:",
            error
        );


        alert(
            "❌ Approval failed:\n\n" +
            error.message
        );

    }

}


/* =====================================================
   REJECT MEMBER
===================================================== */

async function rejectMember(id){

    try{

        const memberRef =
            doc(
                db,
                "members",
                id
            );


        const memberSnap =
            await getDoc(
                memberRef
            );


        if(!memberSnap.exists()){

            alert(
                "❌ Member ମିଳିଲା ନାହିଁ।"
            );

            return;

        }


        const member =
            memberSnap.data();


        /* =============================================
           MUST BE PENDING
        ============================================= */

        const status =
            String(
                member.status || ""
            )
            .trim()
            .toLowerCase();


        if(status !== "pending"){

            alert(
                "⚠️ ଏହି Member Pending ରେ ନାହାନ୍ତି।"
            );

            await loadPendingMembers();

            return;

        }


        /* =============================================
           CONFIRM DELETE
        ============================================= */

        const ok =
            confirm(
                "⚠️ ଏହି Pending Registration କୁ Delete କରିବେ?\n\n" +
                "Name: " +
                (member.name || "Member")
            );


        if(!ok){
            return;
        }


        /* =============================================
           DELETE PENDING MEMBER
        ============================================= */

        await deleteDoc(
            memberRef
        );


        alert(
            "🗑️ Pending Registration Deleted"
        );


        await loadPendingMembers();

    }
    catch(error){

        console.error(
            "Reject Error:",
            error
        );


        alert(
            "❌ Reject failed:\n\n" +
            error.message
        );

    }

}


/* =====================================================
   HTML SECURITY
===================================================== */

function escapeHTML(value){

    return String(value)

        .replace(/&/g,"&amp;")

        .replace(/</g,"&lt;")

        .replace(/>/g,"&gt;")

        .replace(/"/g,"&quot;")

        .replace(/'/g,"&#039;");

}


/* =====================================================
   START
===================================================== */

loadPendingMembers();


console.log(
    "✅ FINAL Pending Members System Loaded"
);

console.log(
    "🔒 New registration = Pending"
);

console.log(
    "🔒 Approval required before Members List"
);

console.log(
    "🔒 Member ID generated ONLY after Approval"
);

console.log(
    "🔒 Payment remains separate from Approval"
);

console.log(
    "💳 WhatsApp Payment Status = Successful"
);
