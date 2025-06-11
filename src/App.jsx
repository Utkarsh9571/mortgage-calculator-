import { useState } from "react";

const formatNumberWithCommas = (num) => {
  if (num === null || num === undefined || num === '') return '';
  const number = parseFloat(num);
  if (isNaN(number)) return '';
  // Use toLocaleString for locale-aware formatting, 'en-GB' for comma thousands separator
  return number.toLocaleString('en-GB', {
    minimumFractionDigits: 0, // Ensure no trailing zeros if integer
    maximumFractionDigits: 2  // Allow up to two decimal places
  });
};

export default function App() {

  const [mortgageAmount, setMortgageAmount] = useState('');
  const [interestRate, setIntereseRate] = useState('');
  const [mortgageTerm, setMortgageTerm] = useState('');
  const [mortgageType, setMortgageType] = useState('repayment');

  const [monthlyPayment, setMonthlyPayment] = useState(null);
  const [totalRepayment, setTotalRepayment] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const [amountErrorMessage, setAmountErrorMessage] = useState(false);
  const [termErrorMessage, setTermErrorMessage] = useState(false);
  const [rateErrorMessage, setRateErrorMessage] = useState(false);

  const handleClearAll = () => {
    setMortgageAmount('');
    setIntereseRate('');
    setMortgageTerm('');
    setMortgageType('repayment');
    setMonthlyPayment(null);
    setTotalRepayment(null);
    setShowResults(false);

    setAmountErrorMessage(false);
    setTermErrorMessage(false);
    setRateErrorMessage(false);
  }


  const calculateRepayments = (e) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload)

    setAmountErrorMessage(false);
    setTermErrorMessage(false);
    setRateErrorMessage(false);

    const P = parseFloat(mortgageAmount);
    const annualR = parseFloat(interestRate);
    const termY = parseFloat(mortgageTerm);

    let isValid = true; // Flag to track overall validity

    // --- Input Validation ---
    if (isNaN(P) || P <= 0) {
      setAmountErrorMessage(true);
      isValid = false;
    }
    if (isNaN(termY) || termY <= 0) {
      setTermErrorMessage(true);
      isValid = false;
    }
    if (isNaN(annualR) || annualR < 0) {
      setRateErrorMessage(true);
      isValid = false;
    }

    if (!isValid) {
      // If any validation failed, hide results and stop
      setMonthlyPayment(null);
      setTotalRepayment(null);
      setShowResults(false);
      return; // Stop the function if validation fails
    }

    // Convert annual interest rate to monthly decimal rate
    const r = (annualR / 100) / 12;
    // Convert loan term from years to total number of monthly payments
    const n = termY * 12;

    let calculatedMonthlyPayment;
    let calculatedTotalRepayment;

    if (mortgageType === 'repayment') {
      // --- Repayment Mortgage Formula ---
      if (r === 0) {
        // Handle zero interest rate case: simple principal division
        calculatedMonthlyPayment = P / n;
      } else {
        // M = P [ r(1 + r)^n / ((1 + r)^n – 1) ]
        calculatedMonthlyPayment = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      }
      calculatedTotalRepayment = calculatedMonthlyPayment * n;

    } else { // mortgageType === 'interestOnly'
      // --- Interest Only Mortgage Formula ---
      // Monthly payment is just interest on the principal
      calculatedMonthlyPayment = P * r;
      // Total repayment is all interest payments + original principal (as principal is due at end)
      calculatedTotalRepayment = (calculatedMonthlyPayment * n) + P;
    }

    // Update state with calculated values
    setMonthlyPayment(calculatedMonthlyPayment.toFixed(2));
    setTotalRepayment(calculatedTotalRepayment.toFixed(2));
    setShowResults(true); // Show the results section
  };
  
  return (
    <div className="bg-project-100 min-h-screen place-content-center grid">
      
    <div className="font-Jakarta bg-white w-full max-w-2xl h-fit mx-auto rounded-2xl lg:flex lg:max-w-4xl">
      <section className="p-6 lg:w-1/2 lg:p-8">
        <div className="lg:flex lg:justify-between">
          <h1 className="text-2xl font-bold text-project-800">Mortgage Calculator</h1>
          <button 
            className="border-b text-project-700 font-medium mt-1 hover:text-project-900 cursor-pointer"
            onClick={handleClearAll}
            >
            Clear All
          </button>
        </div>

        <form 
          className="mt-5 lg:mt-8"
          onSubmit={calculateRepayments}
          >
          <label className="text-sm text-project-700 font-semibold" htmlFor="mortgage-amount">Mortgage Amount</label>
          <div className={`flex items-center border ${amountErrorMessage ? 'border-project-Red' : 'border-project-500'} mt-1.5 mb-3 lg:mt-2.5 lg:mb-4.5 rounded-md hover:border-project-900 cursor-pointer`}>
            <span className={`mortgage-amount ${amountErrorMessage ? 'border-project-Red bg-project-Red text-white' : 'border-project-500 bg-project-100 text-project-700'}`} >£</span>
            <input
              className='w-full p-2 pl-3 font-semibold focus:outline-0 cursor-pointer'
              id="mortgage-amount" 
              type="text" 
              value={formatNumberWithCommas(mortgageAmount)}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/[^0-9.]/g, '');
                setMortgageAmount(rawValue);
                setAmountErrorMessage(false);
              }}
              min='1'
            />
          </div>
          
          {amountErrorMessage && <p className="text-project-Red font-semibold text-sm mb-4">This field is required</p>}

          <div className="sm:flex gap-6">
            <div className="sm:w-1/2">
              <label className="text-sm text-project-700 font-semibold" htmlFor="mortgage-term">Mortgage Term</label>
              <div className={`flex items-center border ${termErrorMessage ? 'border-project-Red' : 'border-project-500'} mt-1.5 mb-3 lg:mt-2.5 lg:mb-4.5 rounded-md hover:border-project-900 cursor-pointer`}>
                <input 
                  className='w-full p-2 pl-3 font-semibold focus:outline-0 cursor-pointer' 
                  id="mortgage-term" 
                  type="number" 
                  value={mortgageTerm}
                  onChange={(e) => {
                    setMortgageTerm(e.target.value);
                    setTermErrorMessage(false);
                  }}
                  min='1'
                />
                <span className={`mortgage-year-rate ${termErrorMessage ? 'border-project-Red bg-project-Red text-white' : 'border-project-500 bg-project-100 text-project-700'}`}>Years</span>
              </div>
            
              {termErrorMessage && <p className="text-project-Red font-semibold text-sm mb-4">This field is required</p>}
            </div>
            
            <div className="sm:w-1/2">
              <label className="text-sm text-project-700 font-semibold" htmlFor="interest">Interest Rate</label>
              <div className={`flex items-center border ${rateErrorMessage ? 'border-project-Red' : 'border-project-500'} mt-1.5 mb-3 lg:mt-2.5 lg:mb-4.5 rounded-md hover:border-project-900 cursor-pointer`}>
                <input 
                  className='w-full p-2 pl-3 font-semibold focus:outline-0 cursor-pointer'  
                  id="interest" 
                  type="number" 
                  value={interestRate}
                  onChange={(e) => {
                    setIntereseRate(e.target.value);
                    setRateErrorMessage(false);
                  }}
                  step='0.01'
                  min='0'
                />
                <span className={`mortgage-year-rate ${rateErrorMessage ? 'border-project-Red bg-project-Red text-white' : 'border-project-500 bg-project-100 text-project-700'}`}>%</span>
              </div>
            
              {rateErrorMessage && <p className="text-project-Red font-semibold text-sm mb-4">This field is required</p>}
            </div> 
          </div>
          
          <legend className="text-sm text-project-700 font-semibold">Mortgage Type</legend>
          <div className="flex gap-6 lg:block">
            <label 
              className={`border ${mortgageType === 'repayment' ? 'border-project-Lime bg-project-Lime/15' : 'border-project-500'} rounded-md w-full flex gap-4 p-2 pl-3 mt-2 lg:mt-3 hover:border-project-Lime cursor-pointer`} 
              htmlFor="repayment"
            >
              <input 
                id="repayment" 
                type="radio" 
                name="repayment-interest"
                value="repayment"
                checked={mortgageType === 'repayment'}
                onChange={()=> setMortgageType('repayment')}
              />
              <span className="font-bold text-project-800">Repayment</span>
            </label>
          
          <label 
            className={`border ${mortgageType === 'interestOnly' ? 'border-project-Lime bg-project-Lime/15' : 'border-project-500'} rounded-md w-full flex gap-4 p-2 pl-3 mt-2 lg:mt-3 hover:border-project-Lime  cursor-pointer`} 
            htmlFor="interest-only"
          >
            <input 
              id="interest-only"  
              type="radio" 
              name="repayment-interest"
              value="interestOnly"
              checked ={mortgageType === 'interestOnly'}
              onChange={() => setMortgageType("interestOnly")} 
            />
            <span className="font-bold text-project-800">Interest Only</span>
          </label>

          </div>
          
          <button 
            className="w-full lg:w-3/4 rounded-full flex justify-center gap-3 text-lg p-4 mt-6 text-project-800 font-black bg-project-Lime hover:bg-hover cursor-pointer" 
            type="submit"
            > 
              <img src="/assets/images/icon-calculator.svg" alt="icon calculator" />
              Calculate Repayments
            </button>
        </form>
      </section>

      <section className="p-6 bg-project-800 rounded-2xl lg:w-1/2 lg:rounded-tl-none lg:rounded-bl-[5em] lg:p-8">
        {showResults ? (
          <div>
            <h1 className="text-white text-3xl font-bold">Your results</h1>
            <p className="text-project-300 py-4 text-base/6 lg:text-[0.9rem] lg:font-semibold">Your results are shown below based on the information you provided. To adjust the results, edit the form and click "calculate repayments" again.</p>
        
            <div className="bg-project-900 p-5 rounded-lg border-t-4 border-project-Lime lg:mt-4 lg:mb-15">
              <div className="border-b border-project-700 sm:flex justify-center items-center gap-8 lg:block">
                <h1 className="text-project-300 font-medium">Your monthly repayments</h1>
                <p className="text-project-Lime text-4xl font-bold mt-3 mb-4 lg:text-6xl lg:mb-8">£{monthlyPayment}</p>
              </div>

              <div className="sm:flex justify-center items-center gap-8 lg:block">
                <h1 className="text-project-300 font-medium mt-3 mb-2 sm:mt-6">Total you'll repay over the term</h1>
                <p className="text-white font-bold text-2xl sm:mt-4 lg:mt-0">£{totalRepayment}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="block text-center lg:flex lg:flex-col lg:h-full lg:justify-center">
            <img
              className="max-w-3/5 mx-auto" 
              src="/assets/images/illustration-empty.svg" 
              alt="illustration empty" 
              />
            <h1 className="text-white text-xl font-semibold mb-4">Results shown here</h1>
            <p className="text-project-300 font-medium text-sm max-w-2/3 mx-auto lg:max-w-full">Complete the form and click "calculate repayments" to see what your monthly repayments would be.</p>
          </div>
        )}
        
      </section>
      
    </div>
    </div>
    )
}


