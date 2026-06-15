import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GroupsPage from '@/app/(dashboard)/groups/page';
import * as clientFetchModule from '@/lib/client-fetch';

jest.mock('@/lib/client-fetch');

const mockClientFetch = clientFetchModule.clientFetch as jest.Mock;

function mockGroupsResponse(groups: object[]) {
  mockClientFetch.mockResolvedValue({
    ok: true,
    json: async () => groups,
  });
}

function mockGroupsError() {
  mockClientFetch.mockResolvedValue({
    ok: false,
    json: async () => ({ error: 'Unauthorized' }),
  });
}

beforeEach(() => {
  mockClientFetch.mockReset();
});

describe('GroupsPage_loadsSuccessfully_displaysGroups', () => {
  it('should display group names returned from /api/groups', async () => {
    mockGroupsResponse([
      { id: 'g1', name: 'Flatmates', memberCount: 3, expenseCount: 5, net: -20, lastTransactionTime: null },
      { id: 'g2', name: 'Trip to Japan', memberCount: 4, expenseCount: 10, net: 50, lastTransactionTime: null },
    ]);

    render(<GroupsPage />);

    await waitFor(() => {
      expect(screen.getByText('Flatmates')).toBeInTheDocument();
      expect(screen.getByText('Trip to Japan')).toBeInTheDocument();
    });
  });
});

describe('GroupsPage_fetchFails_displaysErrorMessage', () => {
  it('should display error message when /api/groups returns non-ok', async () => {
    mockGroupsError();

    render(<GroupsPage />);

    await waitFor(() => {
      expect(screen.getByText('Could not load your groups.')).toBeInTheDocument();
    });
  });
});

describe('GroupsPage_emptyGroups_displaysEmptyState', () => {
  it('should show empty state message when no groups returned', async () => {
    mockGroupsResponse([]);

    render(<GroupsPage />);

    await waitFor(() => {
      expect(screen.getByText('No groups yet.')).toBeInTheDocument();
    });
  });
});

describe('GroupsPage_onLoad_callsClientFetchNotFetch', () => {
  it('should use clientFetch (not raw fetch) when loading groups', async () => {
    const globalFetchSpy = jest.spyOn(global, 'fetch');
    mockGroupsResponse([]);

    render(<GroupsPage />);

    await waitFor(() => {
      expect(mockClientFetch).toHaveBeenCalledWith('/api/groups');
    });

    // Raw fetch should not have been called for the groups endpoint
    const rawFetchCalls = globalFetchSpy.mock.calls.filter(
      ([url]) => typeof url === 'string' && url === '/api/groups',
    );
    expect(rawFetchCalls).toHaveLength(0);

    globalFetchSpy.mockRestore();
  });
});

describe('GroupsPage_createGroup_callsClientFetchWithPostMethod', () => {
  it('should POST to /api/groups with group data when creating a group', async () => {
    // Initial load
    mockClientFetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      // Create group call
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'new-g', groupName: 'New Group' }),
      })
      // Reload after create
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 'new-g', name: 'New Group', memberCount: 1, expenseCount: 0, net: 0, lastTransactionTime: null }],
      });

    render(<GroupsPage />);

    await waitFor(() => screen.getByText('No groups yet.'));

    fireEvent.click(screen.getByText(/Create group/i));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});

describe('GroupsPage_joinGroup_callsClientFetchJoinEndpoint', () => {
  it('should POST to /api/groups/join when joining a group', async () => {
    // Initial load
    mockClientFetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      // Join call
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      // Reload
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    render(<GroupsPage />);

    await waitFor(() => screen.getByText('No groups yet.'));

    fireEvent.click(screen.getByText(/Join group/i));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
