/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable react/prop-types */
import React from 'react';
import { format } from 'date-fns';
import capitalizeFirstLetter from '@src/utils/capitalizeFirstLetter';
// import { popupExceptionKeys } from '@src/constants/map';

const exceptions = [
  // ...popupExceptionKeys,
  'pois',
  'analysis_id',
];

export default function CustomPopupUI({ data = {} }) {
  const popupData = Object.keys(data).reduce((obj, key) => {
    const name = capitalizeFirstLetter(key);
    const exceptionKeys = [...exceptions];
    const value = data[key];
    if (key === 'submitted_date') {
      const date = new Date(value);
      return { ...obj, [name]: format(date, ['MMM do yyyy, h:mm a']) };
    }
    if (exceptionKeys.includes(key)) {
      return { ...obj };
    }
    return { ...obj, [name]: value };
  }, {});

  const { Name, Image, Url, ...filterData } = popupData;

  return (
    <ul className=" flex flex-col gap-2 ">
      {filterData &&
        Object.keys(filterData).map(key => (
          <li
            key={key}
            className="flex items-start text-grey-900"
          >
            <p className="w-1/2 text-grey-900 text-body-lg">
              {key}
            </p>
            <p className="text-grey-900 w-1/2 text-body-lg break-words">
              {filterData[key]?.toString() || '-'}
            </p>
          </li>
        ))}
    </ul>
  );
}
