import {
  Button,
  Form,
  FormSubmitValues,
  Heading,
  Modal,
  Text,
} from '@flmnh-mgcl/ui';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { RequestStatus, RequestType, UserRequest } from '../../types';
import changeRequestStatus from '../utils/changeRequestStatus';
import { accessRoles } from '../utils/constants';
import { useNotify } from '../utils/context';
import useLogError from '../utils/useLogError';
import useQuery from '../utils/useQuery';

type Props = {
  request: UserRequest;
  open: boolean;
  onClose(): void;
  onApprove(): void;
};

type NewAccountViewProps = {
  request: UserRequest;
  onApprove(): void;
};

function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        status === RequestStatus.PENDING && 'bg-yellow-100 text-yellow-800',
        status === RequestStatus.ACCEPTED && 'bg-green-100 text-green-800',
        (status === RequestStatus.REJECTED ||
          status === RequestStatus.FAILED) &&
          'bg-red-100 text-red-800'
      )}
    >
      <svg
        className={clsx(
          '-ml-0.5 mr-1.5 h-2 w-2 ',

          status === RequestStatus.PENDING && 'text-yellow-400',
          status === RequestStatus.ACCEPTED && 'text-green-400',
          (status === RequestStatus.REJECTED ||
            status === RequestStatus.FAILED) &&
            'text-red-400'
        )}
        fill="currentColor"
        viewBox="0 0 8 8"
      >
        <circle cx="4" cy="4" r="3" />
      </svg>
      {status.toString()}
    </span>
  );
}

function NewUserRequestView({ request, onApprove }: NewAccountViewProps) {
  const { from, username, institution, email, description } = request;

  const { notify } = useNotify();
  const { createUser } = useQuery();

  const { logAdminUserError } = useLogError();

  async function doCreate(newUser: any) {
    const ret = await createUser(newUser);

    if (ret) {
      const { status, data } = ret;

      if (status !== 201) {
        logAdminUserError({ status, data: data.err });
        changeRequestStatus(request.id!, RequestStatus.FAILED);
      }
    } else {
      await changeRequestStatus(request.id!, RequestStatus.ACCEPTED).then(
        () => {
          onApprove();
        }
      );
    }
  }

  function handleSubmit(values: FormSubmitValues) {
    const { fullName, username, accessRole } = values;
    const { password } = request;

    if (!fullName || !username || !password || !accessRole) {
      notify({
        title: 'Could not create user',
        message: 'You must complete the user information form entirely',
        level: 'error',
      });
    } else {
      doCreate({
        name: fullName,
        username,
        password,
        access_role: accessRole,
      });
    }
  }

  function NonNullValidator(value: any) {
    if (!value || !value.length) {
      return 'You must complete this field.';
    } else {
      return true;
    }
  }

  return (
    <div>
      <Text>
        {from} has requested a user account to be created for them. They
        requested the following username: {username}.
      </Text>

      <div className="py-3 flex space-x-2">
        <Heading>Request Status: </Heading>
        <StatusBadge status={request.status} />
      </div>

      <div className="pb-3">
        <Heading>Request Details</Heading>
        <div className="mt-2 rounded-md bg-gray-50 dark:bg-dark-500 dark:text-dark-200 p-2">
          <Text>
            <b>From</b>: {from}
          </Text>
          <Text>
            <b>Associated Institution</b>: {institution}
          </Text>
          <Text>
            <b>Return email address</b>: {email}
          </Text>
          <Text>
            <b>Message</b>: {description}
          </Text>
        </div>
      </div>

      <Form onSubmit={handleSubmit} id="create-user-form">
        <Form.Group flex>
          <Form.Input
            id="fullName"
            name="fullName"
            label="Full name"
            defaultValue={from}
            fullWidth
            required
            register={{ validate: NonNullValidator }}
          />

          <Form.Input
            id="username"
            name="username"
            label="Requested username"
            defaultValue={username}
            fullWidth
            required
            register={{ validate: NonNullValidator }}
          />
        </Form.Group>

        <Form.Group>
          <Form.Select
            id="accessRole"
            name="accessRole"
            placeholder="Access Role"
            defaultValue="guest"
            label="Access Role"
            options={accessRoles}
            register={{ validate: NonNullValidator }}
          />
        </Form.Group>
      </Form>
    </div>
  );
}

export default function CreateViewRequestModal({
  request,
  open,
  onClose,
  onApprove,
}: Props) {
  const { _type, title } = request;

  function renderView() {
    if (_type === RequestType.ACCOUNTCREATION) {
      return <NewUserRequestView request={request} onApprove={onApprove} />;
    } else {
      return null;
    }
  }

  function getFormId() {
    if (_type === RequestType.ACCOUNTCREATION) {
      return 'create-user-form';
    } else if (_type === RequestType.UPDATE) {
      return 'update-req-form';
    } else if (_type === RequestType.DELETE) {
      return 'delete-req-form';
    } else {
      return null;
    }
  }

  // this hook should NOT hit, but just in case...
  useEffect(() => {
    setFormId(getFormId());
  }, [_type]);

  const [formId, setFormId] = useState(getFormId());

  return (
    <React.Fragment>
      <Modal open={open} onClose={onClose}>
        <Modal.Content title={title}>{renderView()}</Modal.Content>
        <Modal.Footer>
          <Button.Group>
            <Button onClick={onClose}>Close</Button>
            <Button variant="danger">Reject</Button>
            <Button variant="primary" form={formId} type="submit">
              Accept
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}