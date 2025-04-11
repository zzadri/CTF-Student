import { AppShell, Burger, Group, Title } from '@mantine/core';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

export function MainLayout() {
  const [opened, setOpened] = useState(false);

  return (
    <AppShell
      header={{ height: { base: 50, md: 70 } }}
      navbar={{
        width: { base: 200, lg: 300 },
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: false }
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger
            opened={opened}
            onClick={() => setOpened((o) => !o)}
            hiddenFrom="sm"
            size="sm"
          />
          <Title order={3}>CTF Student Platform</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <span>Menu des challenges</span>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
} 