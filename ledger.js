'use strict';
// Integer demo cents only. No real payment rails, payment credentials or cash-out.
function depositBreakdown(gross){const fee=Math.round(gross*.15);return {gross,fee,credit:gross-fee};}
function prizeShares(pot,winners){if(!winners.length)return [];const each=Math.floor(pot/winners.length),remainder=pot%winners.length;return winners.map((id,i)=>({id,amount:each+(i<remainder?1:0)}));}
module.exports={depositBreakdown,prizeShares};
