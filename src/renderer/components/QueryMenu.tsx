import React, { useState } from 'react';
import CreateCountModal from './modals/CreateCountModal';
import CreateSelectModal from './modals/CreateSelectModal';
import CreateBulkUpdateModal from './modals/CreateBulkUpdateModal';
import { Dropdown } from '@flmnh-mgcl/ui';
import CreateQueryBuilderModal from './modals/CreateQueryBuilderModal';
import { useLocation } from 'react-router-dom';
import CreateQuickFindModal from './modals/CreateQuickFindModal';
import CreateCsvUpdateModal from './modals/CreateCsvUpdateModal';

type Props = {
  disableCrud: boolean;
};

export default function QueryMenu({ disableCrud }: Props) {
  const [currentModal, setCurrentModal] = useState<string>();

  const location = useLocation().pathname;
  const notHome = location !== '/home';

  return (
    <React.Fragment>
      <Dropdown
        label="Query"
        disabled={notHome}
        labelIcon={
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
        }
      >
        <Dropdown.Header text="Query Menu" />

        <Dropdown.Section>
          <Dropdown.Item
            text="Select"
            onClick={() => setCurrentModal('select')}
          />
          <Dropdown.Item
            text="Count"
            onClick={() => setCurrentModal('count')}
          />
        </Dropdown.Section>
        <Dropdown.Section>
          <Dropdown.Item
            text="Update"
            onClick={disableCrud ? undefined : () => setCurrentModal('update')}
          />
          <Dropdown.Item
            text="CSV Update"
            onClick={
              disableCrud ? undefined : () => setCurrentModal('csvUpdate')
            }
          />
        </Dropdown.Section>

        <Dropdown.Section>
          <Dropdown.Item
            text="Advanced"
            onClick={
              disableCrud ? undefined : () => setCurrentModal('advanced')
            }
          />
          <Dropdown.Item
            text="Quick Find"
            onClick={() => setCurrentModal('quick')}
          />
        </Dropdown.Section>
      </Dropdown>
      <CreateSelectModal
        open={currentModal === 'select'}
        onClose={() => setCurrentModal(undefined)}
      />
      <CreateCountModal
        open={currentModal === 'count'}
        onClose={() => setCurrentModal(undefined)}
      />
      <CreateBulkUpdateModal
        open={disableCrud ? false : currentModal === 'update'}
        onClose={() => setCurrentModal(undefined)}
      />
      <CreateQueryBuilderModal
        open={disableCrud ? false : currentModal === 'advanced'}
        onClose={() => setCurrentModal(undefined)}
      />
      <CreateQuickFindModal
        open={currentModal === 'quick'}
        onClose={() => setCurrentModal(undefined)}
      />
      <CreateCsvUpdateModal
        open={currentModal === 'csvUpdate'}
        onClose={() => setCurrentModal(undefined)}
      />
    </React.Fragment>
  );
}
