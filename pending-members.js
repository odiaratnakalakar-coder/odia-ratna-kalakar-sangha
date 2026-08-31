import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    runTransaction,
    addDoc
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* =====================================================
   ELEMENT
===================================================== */

const memberList =
    document.getElementById("memberList");


/* =====================================================
   LOAD PENDING MEMBERS
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
                collection(
                    db,
                    "members"
                )
            );


        memberList.innerHTML = "";

        let pendingFound = false;


        snapshot.forEach(
        docSnap => {

            const member = {

                id:
                    docSnap.id,

                ...docSnap.data()

            };


            /* =================================================
               ONLY NEW PENDING MEMBERS
            ================================================= */

            const status =
                String(
                    member.status ?? ""
                )
                .trim()
                .toLowerCase();


            const approved =
                member.approved === true;


            const approval =
                String(
                    member.approval ?? ""
                )
                .trim()
                .toLowerCase();


            /*
            -------------------------------------------------
            Pending member means:

            status = pending

            AND

            approved != true

            AND

            approval != approved
            -------------------------------------------------
            */

            if(
                status !== "pending" ||
                approved === true ||
                approval === "approved"
            ){

                return;

            }


            pendingFound = true;


            /* =================================================
               CARD
            ================================================= */

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "member-card";


            /* =================================================
               PHOTO
            ================================================= */

            const photo =
                document.createElement(
                    "img"
                );


            photo.src =
                member.photoUrl ||
                "images/default-user.png";


            photo.alt =
                member.name ||
                "Member";


            photo.onerror =
            function(){

                this.onerror = null;

                this.src =
                    "images/default-user.png";

            };


            card.appendChild(
                photo
            );


            /* =================================================
               NAME
            ================================================= */

            const name =
                document.createElement(
                    "h3"
                );


            name.textContent =
                member.name ||
                "Member";


            card.appendChild(
                name
            );


            /* =================================================
               MEMBER ID
            ================================================= */

            const memberId =
                document.createElement(
                    "p"
                );


            memberId.innerHTML =
                "<b>Member ID:</b> " +
                (
                    member.memberId ||
                    "-"
                );


            card.appendChild(
                memberId
            );


            /* =================================================
               MOBILE
            ================================================= */

            const mobile =
                document.createElement(
                    "p"
                );


            mobile.innerHTML =
                "<b>Mobile:</b> " +
                (
                    member.mobile ||
                    "-"
                );


            card.appendChild(
                mobile
            );


            /* =================================================
               ADDRESS
            ================================================= */

            const address =
                document.createElement(
                    "p"
                );


            address.innerHTML =
                "<b>Address:</b> " +
                (
                    member.address ||
                    "-"
                );


            card.appendChild(
                address
            );


            /* =================================================
               PAYMENT
            ================================================= */

            const payment =
                document.createElement(
                    "p"
                );


            payment.innerHTML =
                `
                <b>Payment:</b>
                <span style="color:#ffcc00;">
                    ⏳ Pending
                </span>
                `;


            card.appendChild(
                payment
            );


            /* =================================================
               APPROVAL
            ================================================= */

            const approvalText =
                document.createElement(
                    "p"
                );


            approvalText.innerHTML =
                `
                <b>Approval:</b>
                <span style="color:#ffcc00;">
                    ⏳ Pending
                </span>
                `;


            card.appendChild(
                approvalText
            );


            /* =================================================
               ACTIONS
            ================================================= */

            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "actions";


            /* =================================================
               APPROVE BUTTON
            ================================================= */

            const approveButton =
                document.createElement(
                    "button"
                );


            approveButton.className =
                "approve";


            approveButton.type =
                "button";


            approveButton.textContent =
                "✅ Approve";


            approveButton.addEventListener(
                "click",
                function(){

                    approveMember(
                        member.id
                    );

                }
            );


            /* =================================================
               REJECT BUTTON
            ================================================= */

            const rejectButton =
                document.createElement(
                    "button"
                );


            rejectButton.className =
                "reject";


            rejectButton.type =
                "button";


            rejectButton.textContent =
                "❌ Reject";


            rejectButton.addEventListener(
                "click",
                function(){

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


        /* =================================================
           NO PENDING
        ================================================= */

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

                ${escapeHTML(
                    error.message
                )}

            </div>

        `;

    }

}


/* =====================================================
   GENERATE NEXT MEMBER ID
===================================================== */

async function getNextMemberId(){

    const counterRef =
        doc(
            db,
            "system",
            "counter"
        );


    const memberId =
        await runTransaction(
            db,
            async(transaction)=>{


                const counterSnap =
                    await transaction.get(
                        counterRef
                    );


                let number =
                    1;


                if(
                    counterSnap.exists()
                ){

                    number =
                        Number(
                            counterSnap
                            .data()
                            .lastNumber || 0
                        ) + 1;

                }


                transaction.set(
                    counterRef,
                    {
                        lastNumber:
                            number
                    }
                );


                return (
                    "ORKS" +
                    String(number)
                    .padStart(4,"0")
                );

            }
        );


    return memberId;

}


/* =====================================================
   APPROVE MEMBER
===================================================== */

window.approveMember =
async function(id){

    try{

        /* =================================================
           MEMBER REFERENCE
        ================================================= */

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


        if(
            !memberSnap.exists()
        ){

            alert(
                "❌ Member ମିଳିଲା ନାହିଁ।"
            );

            return;

        }


        const member =
            memberSnap.data();


        /* =================================================
           CHECK CURRENT STATUS
        ================================================= */

        const currentStatus =
            String(
                member.status ?? ""
            )
            .trim()
            .toLowerCase();


        if(
            currentStatus !== "pending"
        ){

            alert(
                "⚠️ ଏହି Member Pending ରେ ନାହାନ୍ତି।"
            );

            loadPendingMembers();

            return;

        }


        /* =================================================
           CONFIRM APPROVAL
        ================================================= */

        const confirmApproval =
            confirm(
                "ଏହି Member କୁ Approve କରିବେ?\n\n" +
                "Name: " +
                (
                    member.name ||
                    "Member"
                )
            );


        if(!confirmApproval){

            return;

        }


        /* =================================================
           GET MEMBER ID
        ================================================= */

        const memberId =
            await getNextMemberId();


        /* =================================================
           RECEIPT
        ================================================= */

        const txnId =
            "RCPT-" +
            Date.now();


        /* =================================================
           UPDATE MEMBER

           ONLY THIS PENDING MEMBER
        ================================================= */

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

                paid:
                    true,

                txnId:
                    txnId

            }
        );


        /* =================================================
           INCOME ENTRY
        ================================================= */

        await addDoc(
            collection(
                db,
                "income"
            ),
            {

                memberId:
                    memberId,

                name:
                    member.name ||
                    "",

                mobile:
                    member.mobile ||
                    "",

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


        /* =================================================
           SUCCESS
        ================================================= */

        alert(
            "✅ Member Approved Successfully\n\n" +

            "Name: " +
            (
                member.name ||
                "Member"
            ) +

            "\n\nMember ID: " +
            memberId
        );


        /* =================================================
           WHATSAPP
        ================================================= */

        const mobile =
            String(
                member.mobile ||
                ""
            )
            .replace(
                /\D/g,
                ""
            );


        if(mobile){

            let whatsappNumber =
                mobile;


            if(
                whatsappNumber.length === 10
            ){

                whatsappNumber =
                    "91" +
                    whatsappNumber;

            }


            const message =
`ନମସ୍କାର 🙏

🌺 ଜୟ ଜଗନ୍ନାଥ 🚩

ପ୍ରିୟ ${member.name || "Member"},

ଆପଣଙ୍କ ସଦସ୍ୟ ପଞ୍ଜୀକରଣ ସଫଳତାର ସହିତ ଅନୁମୋଦିତ ହୋଇଛି।

ଆପଣ ବର୍ତ୍ତମାନ “ଓଡ଼ିଆ ରତ୍ନ କଳାକାର ସଂଘ, ସୁରତ”ର ଜଣେ ସ୍ୱୀକୃତ ସଦସ୍ୟ।

ଆପଣଙ୍କ ସଦସ୍ୟ ID: ${memberId}

ସଂଘ ପକ୍ଷରୁ ଆପଣଙ୍କୁ ହାର୍ଦ୍ଦିକ ସ୍ୱାଗତ। 🙏🌹

ଆମର ଲକ୍ଷ୍ୟ — ଏକତା, ସେବା ଓ ଓଡ଼ିଆ ସଂସ୍କୃତିର ସୁରକ୍ଷା। 🤝

ଜୟ ଜଗନ୍ନାଥ 🚩🙏

ଧନ୍ୟବାଦ।
ଓଡ଼ିଆ ରତ୍ନ କଳାକାର ସଂଘ, ସୁରତ`;


            const whatsappURL =
                "https://wa.me/" +
                whatsappNumber +
                "?text=" +
                encodeURIComponent(
                    message
                );


            const openWhatsApp =
                confirm(
                    "📱 WhatsApp Message ପଠାଇବେ?\n\n" +
                    "Member: " +
                    (
                        member.name ||
                        "Member"
                    )
                );


            if(openWhatsApp){

                window.location.href =
                    whatsappURL;

                return;

            }

        }


        /* =================================================
           RELOAD PENDING LIST
        ================================================= */

        loadPendingMembers();

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

};


/* =====================================================
   REJECT MEMBER
===================================================== */

window.rejectMember =
async function(id){

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


        if(
            !memberSnap.exists()
        ){

            alert(
                "❌ Member ମିଳିଲା ନାହିଁ।"
            );

            return;

        }


        const member =
            memberSnap.data();


        /* =================================================
           ONLY PENDING CAN BE REJECTED
        ================================================= */

        if(
            member.status !== "pending"
        ){

            alert(
                "⚠️ ଏହି Member Pending ରେ ନାହାନ୍ତି।"
            );

            loadPendingMembers();

            return;

        }


        const ok =
            confirm(
                "ଏହି Pending Member କୁ Delete କରିବେ?\n\n" +
                "Name: " +
                (
                    member.name ||
                    "Member"
                )
            );


        if(!ok){

            return;

        }


        await deleteDoc(
            memberRef
        );


        alert(
            "❌ Member Rejected Successfully"
        );


        loadPendingMembers();

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

};


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value){

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


/* =====================================================
   START
===================================================== */

loadPendingMembers();


console.log(
    "✅ Pending Members System Loaded"
);

console.log(
    "🔒 Approval required before Members List"
);

console.log(
    "🔒 Member ID generated only after approval"
);
