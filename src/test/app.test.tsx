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

  it('scopes the expense list to a single day', async () => {
    const user = userEvent.setup();
    renderApp();

    await addExpense(user, '500', 'Food', 'Lunch with friends');
    await user.click(screen.getByRole('button', { name: /Expenses/ }));
    await user.click(screen.getByRole('button', { name: 'Day' }));

    // The day view leads with its own total, and still lists the entry.
    expect(await screen.findByText('Total spent')).toBeInTheDocument();
    expect(screen.getByText('Lunch with friends')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Month' }));
    expect(screen.queryByText('Total spent')).not.toBeInTheDocument();
  });

  it('switches theme and clears everything from settings', async () => {
    const user = userEvent.setup();
    renderApp();

    await addExpense(user, '500', 'Food');
    await user.click(screen.getByRole('button', { name: /Settings/ }));

    expect(screen.getByText('1 expense recorded')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'dark' }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    // A bad backup is reported rather than swallowed.
    await user.click(screen.getByText('Restore from backup'));
    const importSheet = await screen.findByRole('dialog');
    await user.type(within(importSheet).getByLabelText(/paste backup text/i), 'not json');
    await user.click(within(importSheet).getByRole('button', { name: 'Restore' }));
    expect(within(importSheet).getByText(/valid backup file/)).toBeInTheDocument();
    await user.click(within(importSheet).getByRole('button', { name: 'Close' }));

    // Deleting everything asks first.
    await user.click(screen.getByText('Delete all data'));
    const resetSheet = await screen.findByRole('dialog');
    expect(within(resetSheet).getByText(/cannot be undone/)).toBeInTheDocument();
    await user.click(within(resetSheet).getByRole('button', { name: 'Delete everything' }));

    expect(await screen.findByText('0 expenses recorded')).toBeInTheDocument();
  });

  it('refuses a category name that is already taken', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: /Categories/ }));
    await user.click(screen.getByRole('button', { name: /New/ }));

    // "food" clashes with the built-in "Food" - two categories with the same
    // name would split a total the user reads as one number.
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Name'), 'food');
    await user.click(within(dialog).getByRole('button', { name: 'Add category' }));

    expect(within(dialog).getByText(/already exists/)).toBeInTheDocument();
    // Still open - nothing was saved.
    expect(screen.getByRole('dialog')).toBeInTheDocument();
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

  it('renames a category and changes its icon', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: /Categories/ }));
    await user.click(screen.getByRole('button', { name: 'Edit Food' }));

    const dialog = await screen.findByRole('dialog');
    const name = within(dialog).getByLabelText('Name');
    await user.clear(name);
    await user.type(name, 'Groceries');
    await user.click(within(dialog).getByRole('button', { name: 'Icon 🍎' }));
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Groceries')).toBeInTheDocument();
    expect(screen.queryByText('Food')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Edit Groceries')).toBeInTheDocument();
  });

  it('does not offer to delete a built-in category', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: /Categories/ }));
    await user.click(screen.getByRole('button', { name: 'Edit Food' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
  });

  it('deletes a custom category and moves its expenses to Other', async () => {
    const user = userEvent.setup();
    renderApp();

    // A custom category with one expense filed under it.
    await user.click(screen.getByRole('button', { name: /Categories/ }));
    await user.click(screen.getByRole('button', { name: /New/ }));
    let dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Name'), 'Momo runs');
    await user.click(within(dialog).getByRole('button', { name: 'Add category' }));

    await user.click(screen.getByRole('button', { name: /Dashboard/ }));
    await addExpense(user, '250', 'Momo runs');

    await user.click(screen.getByRole('button', { name: /Categories/ }));
    await user.click(await screen.findByRole('button', { name: 'Edit Momo runs' }));

    dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
    // The confirmation says what happens to the money, not just "are you sure".
    expect(within(dialog).getByText(/1 expense will move to Other/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(await screen.findByText(/1 moved to Other/)).toBeInTheDocument();
    expect(screen.queryByText('Momo runs')).not.toBeInTheDocument();

    // The Rs. 250 is still in the book, now filed under Other.
    const otherRow = [...document.querySelectorAll('.setrow')].find(
      (row) => row.querySelector('.setrow-title')?.textContent === 'Other',
    );
    expect(otherRow).toHaveTextContent('1 entry · Rs. 250');
  });

  it('lists categories by spend, biggest first', async () => {
    const user = userEvent.setup();
    renderApp();

    await addExpense(user, '500', 'Food');
    await addExpense(user, '1200', 'Travel');
    await user.click(screen.getByRole('button', { name: /Categories/ }));

    const titles = [...document.querySelectorAll('.setrow-title')].map((n) => n.textContent);
    expect(titles.slice(0, 2)).toEqual(['Travel', 'Food']);
    // Everything unused sorts after them, alphabetically.
    expect(titles[2]).toBe('Clothes');
  });

  it('drills from a dashboard category into a filtered expense list', async () => {
    const user = userEvent.setup();
    renderApp();

    await addExpense(user, '500', 'Food');
    await addExpense(user, '300', 'Travel');

    // The bar carries its numbers in a title, which is also what a hover shows.
    await user.click(screen.getByTitle(/^Food: Rs\. 500/));

    expect(await screen.findByRole('heading', { name: 'Expenses', level: 1 })).toBeInTheDocument();
    // Scoped to Food only - the Travel entry is filtered out.
    expect(screen.getByText(/1 entry/)).toBeInTheDocument();
    expect(screen.queryByText('Rs. 300')).not.toBeInTheDocument();
  });

  it('steps back to an empty previous month and returns', async () => {
    const user = userEvent.setup();
    renderApp();

    await addExpense(user, '500', 'Food');
    await waitFor(() => expect(heroTotal()).toHaveTextContent('Rs. 500'));

    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    await waitFor(() => expect(heroTotal()).toHaveTextContent('Rs. 0'));

    await user.click(screen.getByRole('button', { name: 'This month' }));
    await waitFor(() => expect(heroTotal()).toHaveTextContent('Rs. 500'));
  });

  it('restores a pasted backup over whatever is there', async () => {
    const user = userEvent.setup();
    renderApp();

    await addExpense(user, '500', 'Food');
    await user.click(screen.getByRole('button', { name: /Settings/ }));
    expect(screen.getByText('1 expense recorded')).toBeInTheDocument();

    await user.click(screen.getByText('Restore from backup'));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByLabelText(/paste backup text/i));
    await user.paste(JSON.stringify({
      version: 1,
      categories: [],
      expenses: [{
        id: 'restored-1', amount: 1234, date: '2083-05-10', categoryId: 'food',
        description: 'From the backup', createdAt: 1, updatedAt: 1,
      }],
    }));
    await user.click(within(dialog).getByRole('button', { name: 'Restore' }));

    expect(await screen.findByText('Restored 1 expense')).toBeInTheDocument();
    expect(screen.getByText(/Rs\. 1,234 all time/)).toBeInTheDocument();
  });

  it('keeps a custom category and its expenses across a reload', async () => {
    const user = userEvent.setup();
    const first = renderApp();

    await user.click(screen.getByRole('button', { name: /Categories/ }));
    await user.click(screen.getByRole('button', { name: /New/ }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Name'), 'Momo runs');
    await user.click(within(dialog).getByRole('button', { name: 'Add category' }));

    await user.click(screen.getByRole('button', { name: /Dashboard/ }));
    await addExpense(user, '250', 'Momo runs', 'Momos at Boudha');
    await waitFor(() => expect(heroTotal()).toHaveTextContent('Rs. 250'));

    first.unmount();
    renderApp();

    await waitFor(() => expect(heroTotal()).toHaveTextContent('Rs. 250'));
    await user.click(screen.getByRole('button', { name: /Expenses/ }));
    const row = (await screen.findByText('Momos at Boudha')).closest('.row');
    expect(within(row as HTMLElement).getByText('Momo runs')).toBeInTheDocument();
    expect(within(row as HTMLElement).getByText('Rs. 250')).toBeInTheDocument();
  });
});
