import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { AppProvider } from '../store';
import { formatMonth, todayBs } from '../lib/nepaliDate';

function renderApp() {
  return render(
    <AppProvider>
      <App />
    </AppProvider>,
  );
}

/**
 * The month total shown as the dashboard hero figure. Scoped deliberately:
 * the same rupee amount legitimately appears in the tiles and the category
 * bars too, so a bare text query would be ambiguous.
 */
function heroTotal(): HTMLElement {
  const hero = document.querySelector('.hero-value');
  if (!hero) throw new Error('hero figure is not on screen');
  return hero as HTMLElement;
}

/** Walk the add-expense flow the way a user would. */
async function addExpense(
  user: ReturnType<typeof userEvent.setup>,
  amount: string,
  category: string,
  description?: string,
) {
  await user.click(screen.getByRole('button', { name: 'Add expense' }));

  const dialog = await screen.findByRole('dialog');
  await user.type(within(dialog).getByLabelText('Amount'), amount);
  await user.click(within(dialog).getByRole('button', { name: new RegExp(category) }));

  if (description) {
    await user.type(within(dialog).getByLabelText(/Description/), description);
  }

  await user.click(within(dialog).getByRole('button', { name: 'Save expense' }));
}

describe('the app end to end', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts on the dashboard for the current Nepali month', () => {
    renderApp();
    const today = todayBs();

    expect(screen.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(`Total spent in ${formatMonth(today.year, today.month)}`)).toBeInTheDocument();
    expect(heroTotal()).toHaveTextContent('Rs. 0');
  });

  it('records an expense and reflects it in the monthly total', async () => {
    const user = userEvent.setup();
    renderApp();

    await addExpense(user, '500', 'Food', 'Lunch with friends');

    // The hero figure picks it up immediately.
    await waitFor(() => expect(heroTotal()).toHaveTextContent('Rs. 500'));
    // ...and so does the category chart.
    expect(screen.getByText('1 category used')).toBeInTheDocument();
  });

  it('adds several expenses on the same day and totals them', async () => {
    const user = userEvent.setup();
    renderApp();

    await addExpense(user, '500', 'Food');
    await addExpense(user, '1200', 'Dry Fruits');
    await addExpense(user, '300', 'Ride Sharing');

    // The spec's worked example: three entries, Rs. 2,000 for the day.
    await waitFor(() => expect(heroTotal()).toHaveTextContent('Rs. 2,000'));
    expect(screen.getByText('3 categories used')).toBeInTheDocument();

    const transactions = screen.getByText('Transactions').closest('.tile');
    expect(within(transactions as HTMLElement).getByText('3')).toBeInTheDocument();
  });

  it('names the highest-spending category', async () => {
    const user = userEvent.setup();
    renderApp();

    await addExpense(user, '500', 'Food');
    await addExpense(user, '1200', 'Dry Fruits');

    const tile = screen.getByText('Highest category').closest('.tile');
    expect(within(tile as HTMLElement).getByText(/Dry Fruits/)).toBeInTheDocument();
    expect(within(tile as HTMLElement).getByText('Rs. 1,200')).toBeInTheDocument();
  });

  it('lists the expense on the Expenses screen and can edit it', async () => {
    const user = userEvent.setup();
    renderApp();

    await addExpense(user, '500', 'Food', 'Lunch with friends');
    await user.click(screen.getByRole('button', { name: /Expenses/ }));

    expect(await screen.findByText('Lunch with friends')).toBeInTheDocument();

    // Open the row, change the amount, save.
    await user.click(screen.getByText('Lunch with friends'));
    const dialog = await screen.findByRole('dialog');
    const amount = within(dialog).getByLabelText('Amount');
    await user.clear(amount);
    await user.type(amount, '650');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    // Assert on the row itself - we are on the Expenses screen, not the dashboard.
    await waitFor(() => {
      const row = screen.getByText('Lunch with friends').closest('.row');
      expect(row).toHaveTextContent('Rs. 650');
    });
    expect(screen.queryByText('Rs. 500')).not.toBeInTheDocument();
  });

  it('deletes an expense through the confirmation step', async () => {
    const user = userEvent.setup();
    renderApp();

    await addExpense(user, '500', 'Food', 'Lunch with friends');
    await user.click(screen.getByRole('button', { name: /Expenses/ }));
    await user.click(await screen.findByText('Lunch with friends'));

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Delete expense' }));
    // A confirmation stands between the tap and the loss.
    expect(within(dialog).getByText(/cannot be undone/i)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(await screen.findByText('Nothing here yet')).toBeInTheDocument();
  });

  it('survives a reload by restoring from local storage', async () => {
    const user = userEvent.setup();
    const first = renderApp();

    await addExpense(user, '500', 'Food');
    await waitFor(() => expect(heroTotal()).toHaveTextContent('Rs. 500'));

    first.unmount();
    renderApp();

    await waitFor(() => expect(heroTotal()).toHaveTextContent('Rs. 500'));
  });

  it('creates a custom category and files an expense under it', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: /Categories/ }));
    await user.click(screen.getByRole('button', { name: /New/ }));

    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Name'), 'Momo runs');
    await user.click(within(dialog).getByRole('button', { name: 'Add category' }));

    expect(await screen.findByText('Momo runs')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Dashboard/ }));
    await addExpense(user, '250', 'Momo runs');

    await waitFor(() => expect(heroTotal()).toHaveTextContent('Rs. 250'));
  });

  it('refuses to save without an amount or a category', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Add expense' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Save expense' }));

    expect(within(dialog).getByText('Enter an amount')).toBeInTheDocument();
    expect(within(dialog).getByText('Pick a category')).toBeInTheDocument();
    // Still open - nothing was saved.
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
