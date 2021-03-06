import { Button, FormSubmitValues, Modal } from '@flmnh-mgcl/ui';
import React from 'react';
import CircleButton from '../buttons/CircleButton';
import UserInfoForm from '../forms/UserInfoForm';
import useLogError from '../utils/useLogError';
import useQuery from '../utils/useQuery';
import useToggle from '../utils/useToggle';

type Props = {
  refresh(): void;
};

export default function CreateCreateUserModal({ refresh }: Props) {
  const [open, { on, off }] = useToggle(false);
  const [loading, { toggle }] = useToggle(false);

  const { createUser } = useQuery();

  const { logAdminUserError } = useLogError();

  async function handleSubmit(values: FormSubmitValues) {
    toggle();

    const { fullName, username, password, role } = values;

    const newUser = {
      name: fullName,
      username,
      password,
      access_role: role,
    };

    const ret = await createUser(newUser);

    // TODO:
    if (ret) {
      const { status, data } = ret;

      if (status !== 201) {
        logAdminUserError({ status, data: data.err });
      }
    } else {
      refresh();
      off();
    }

    toggle();
  }

  return (
    <React.Fragment>
      <Modal open={open} onClose={off}>
        <Modal.Content title="Create User">
          <UserInfoForm onSubmit={handleSubmit} />
        </Modal.Content>
        <Modal.Footer>
          <Button.Group>
            <Button onClick={off}>Cancel</Button>
            <Button
              type="submit"
              form="user-info-form"
              variant="primary"
              loading={loading}
            >
              Confirm
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal>

      <CircleButton
        onClick={on}
        icon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        }
      />
    </React.Fragment>
  );
}
