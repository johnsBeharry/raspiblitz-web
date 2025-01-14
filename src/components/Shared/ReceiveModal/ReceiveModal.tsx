import QRCode from 'qrcode.react';
import { ChangeEvent, FC, FormEvent, useState } from 'react';
import ModalDialog from '../../../container/ModalDialog/ModalDialog';
import AmountInput from '../AmountInput/AmountInput';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const ReceiveModal: FC<ReceiveModalProps> = (props) => {
  const [invoiceType, setInvoiceType] = useState('lightning');
  const [buttonText, setButtonText] = useState('Copy to Clipboard');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const lnInvoice = invoiceType === 'lightning';

  const btnClasses =
    'text-center h-10 bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-400 rounded-lg w-full text-white';

  const invoiceChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    setInvoiceType(event.target.value);
    setAddress('');
    setAmount(0);
    setComment('');
  };

  const commentChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    setComment(event.target.value);
  };

  const amountChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    setAmount(+event.target.value);
  };

  const generateAddressHandler = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    const body = {
      type: invoiceType,
      amount: lnInvoice ? amount : undefined,
      comment: lnInvoice ? comment : undefined
    };
    const resp = await fetch('http://localhost:8081/receive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const respObj = await resp.json();
    setIsLoading(false);
    setAddress(respObj.address);
  };

  const copyToClipboardHandler = () => {
    navigator.clipboard.writeText(address);
    setButtonText('✅ Copied!');

    setTimeout(() => {
      setButtonText('Copy to Clipboard');
    }, 3000);
  };

  const showLnInvoice = lnInvoice && !isLoading && !address;

  const radioStyles =
    'px-3 py-2 border rounded-lg border-gray-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-400 dark:text-white';
  const lnStyle = invoiceType === 'lightning' ? 'bg-blue-500 text-white' : '';
  const walletStyle = invoiceType === 'onchain' ? 'bg-blue-500 text-white' : '';

  return (
    <ModalDialog close={props.onClose}>
      {showLnInvoice && <div className='text-xl font-bold'>Create a Lightning Invoice</div>}
      {!showLnInvoice && <div className='text-xl font-bold'>Fund your Wallet</div>}
      <div className='pt-5 pb-1 flex justify-center'>
        <div className='px-2'>
          <label htmlFor='lightning' className={`${radioStyles} ${lnStyle}`}>
            Lightning
          </label>
          <input
            id='lightning'
            type='radio'
            className='hidden checked:border-green-500 checked:block'
            name='invoiceType'
            value='lightning'
            onChange={invoiceChangeHandler}
          />
        </div>
        <div className='px-2'>
          <label htmlFor='onchain' className={`${radioStyles} ${walletStyle}`}>
            Fund Wallet
          </label>
          <input
            id='onchain'
            type='radio'
            className='hidden'
            name='invoiceType'
            value='onchain'
            onChange={invoiceChangeHandler}
          />
        </div>
      </div>
      {address && <div className='my-5'>Scan this QR Code or copy the below address to receive funds</div>}
      {address && (
        <div className='my-5 flex justify-center'>
          <QRCode value={address} />
        </div>
      )}
      <form className='flex flex-col items-center' onSubmit={generateAddressHandler}>
        <div className='w-full overflow-x-auto m-2'>{address}</div>
        <div className='w-4/5 mb-5'>
          {isLoading && (
            <div className='p-5'>
              <LoadingSpinner />
            </div>
          )}
          {showLnInvoice && (
            <div className='flex flex-col pb-5 justify-center text-center'>
              <AmountInput amount={amount} onChangeAmount={amountChangeHandler} />
              <div className='flex flex-col justify-center'>
                <label
                  htmlFor='comment'
                  className='block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 text-left'
                >
                  Comment
                </label>
                <input
                  id='comment'
                  type='text'
                  value={comment}
                  onChange={commentChangeHandler}
                  className='rounded dark:text-black'
                />
              </div>
            </div>
          )}

          {!address && (
            <button type='submit' className={btnClasses}>
              Generate Address
            </button>
          )}

          {address && (
            <button type='button' onClick={copyToClipboardHandler} className={btnClasses}>
              {buttonText}
            </button>
          )}
        </div>
      </form>
    </ModalDialog>
  );
};

export default ReceiveModal;

export interface ReceiveModalProps {
  onClose: () => void;
}
