const database = {
    users: [
      {
        id: "1",
        name: "Ali",
        email: "Ali@example.com",
        password: "1232",
        wallet: {
          balance: 12457,
          currency: "MAD",
          cards: [
            { numcards: "124847", type: "visa",       balance: "14712", expiry: "14-08-27", vcc: "147" },
            { numcards: "124478", type: "mastercard", balance: "1470",  expiry: "14-08-28", vcc: "257" },
          ],
          transactions: [
            { id: "1", type: "credit", amount: 140, date: "14-08-25", from: "Ahmed", to: "124847" },
            { id: "2", type: "debit",  amount: 200, date: "13-08-25", from: "124847", to: "Amazon" },
            { id: "3", type: "credit", amount: 250, date: "12-08-25", from: "Ahmed", to: "124478" },
          ]
        }
      },
      {
        id: "2",
        name: "Sara",
        email: "Sara@example.com",
        password: "5678",
        wallet: {
          balance: 8300,
          currency: "MAD",
          cards: [
            { numcards: "987654", type: "visa", balance: "5000", expiry: "20-11-26", vcc: "321" },
          ],
          transactions: [
            { id: "1", type: "credit", amount: 500, date: "10-08-25", from: "Ali",    to: "987654" },
            { id: "2", type: "debit",  amount: 120, date: "11-08-25", from: "987654", to: "Carrefour" },
          ]
        }
      }
    ]
};

const finduserbymail = (mail, password) => {
    return database.users.find(u => u.email === mail && u.password === password);
};
const finduserbyaccount = (numcompte) => {
    return database.users.find(u => u.wallet.cards.some(c => c.numcards === numcompte));
};

const getbeneficiaries = (userId) => {
    return database.users.filter(u => u.id !== userId);
};

const findbeneficiarieByid = (userId, beneficiaryId) => {
    return database.users.find(u => u.id === beneficiaryId);
};

export { database, finduserbyaccount, getbeneficiaries, findbeneficiarieByid };
export default finduserbymail;
