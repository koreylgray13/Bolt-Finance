import React from 'react';
import {useTranslation} from 'react-i18next'


  
 
const Footer = () => {
    const {t} = useTranslation();
    return (
        <div className='max-w-[1240px] mx-auto py-8 px-4 grid lg:grid-cols-3 gap-6 text-gray-300'>
            <div>
                <h1 className='w-full text-3xl font-bold text-[#00df9a]'>Bolt Finance</h1>
            </div>
            <div className='lg:col-span-2 flex justify-between mt-3'>
                <div>

                </div>
                <div>
                    <a href='/contact' className='font-medium text-gray-400'>{t('contact')}</a>
                </div>
                <div>
                    <a href='/ToS' className='font-medium text-gray-400'>{t('terms')}</a>
                </div>
                <div>
                    <h6 className='font-medium text-gray-400'>{t('privacy')}</h6>
                </div>

                <div>
                    <h6 className='font-medium text-gray-400'>{t('support')}</h6>
                </div>
                <div>
                    <h6 className='font-medium text-gray-400'>{t('company')}</h6>
                </div>
                <div>
                    <h6 className='font-medium text-gray-400'>{t('legal')}</h6>
                </div>
            </div>
        </div>
    );
};


export default Footer;