# Component Structure Deep-Dive

## Expo Router: File-Based Routing

Expo Router maps files to routes automatically. File `app/(auth)/login.tsx` becomes web route `/login` and native screen with deep link `exp://breakdown/login`. Single file serves all platforms.

Dynamic routes: `app/group/[groupId]/transactions.tsx` maps to `/group/:groupId/transactions`. Access params via `useLocalSearchParams()`.

## Layout Nesting

Layout files (`_layout.tsx`) create navigation stacks and control animations.

```
app/
├── _layout.tsx                    (Root)
├── (auth)/
│   ├── _layout.tsx                (Auth stack)
│   ├── login.tsx
│   └── register.tsx
└── (app)/
    ├── _layout.tsx                (Bottom tabs)
    ├── home/index.tsx
    ├── groups/index.tsx
    └── settings/index.tsx
```

Root wraps app, (auth) handles login, (app) provides tabs.

## Screen Anatomy

```typescript
import { useGroupTransactions } from '@/queries';
import { useAppStore } from '@/stores/appStore';

export default function GroupTransactionsScreen() {
  const { groupId } = useLocalSearchParams();
  const { data, isLoading, error } = useGroupTransactions(groupId);
  const setCurrentGroupId = useAppStore((s) => s.setCurrentGroupId);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Transactions" />
      {error && <ErrorBoundary error={error} />}
      {isLoading ? <LoadingSpinner /> : <TransactionList data={data} />}
    </SafeAreaView>
  );
}
```

Pattern: Queries/stores at top, hooks for data, render with `<ScreenHeader>` + content + error boundary.

## Design System Library

~18 components in `components/ui/`:

**Navigation:** `ScreenHeader`, `BottomTabBar`

**Input:** `TextInput`, `Button`, `Checkbox`, `DatePicker` (native on iOS/Android, HTML on web)

**Display:** `Card`, `Badge`, `Avatar`, `Chip`

**Feedback:** `Toast`, `BottomSheet`, `Dialog`, `LoadingSpinner`

Composition example:
```typescript
<Card>
  <CardHeader><Avatar /><Heading>Title</Heading></CardHeader>
  <CardBody><Text>Content</Text></CardBody>
</Card>
```

## Platform Guards

Use `Platform.OS` for layout variations:

```typescript
if (Platform.OS === 'web') {
  return (
    <View style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
      {groups.map(g => <GroupCard key={g.id} group={g} />)}
    </View>
  );
}
return <FlatList data={groups} renderItem={({ item }) => <GroupCard group={item} />} />;
```

Web uses CSS Grid; native uses FlatList.

## Deep Link Routing

Deep links enable URL navigation. Format: `exp://breakdown/group/123/transactions`. Web navigates to `/group/123/transactions`, native opens Expo with deep link.

Configure in `app.json`:
```json
{ "scheme": "exp://breakdown" }
```

Navigation:
```typescript
const router = useRouter();
router.push('/group/123/transactions');
```

## Multi-Platform Example

```typescript
// app/(app)/group/[groupId]/transactions.tsx
import { useGroupTransactions } from '@/queries';
import { FlatList, SafeAreaView, Platform } from 'react-native';
import { ScreenHeader, ErrorBoundary } from '@/components/ui';

export default function GroupTransactionsScreen() {
  const { groupId } = useLocalSearchParams();
  const { data: transactions, isLoading, error } = useGroupTransactions(groupId);

  if (error) return <ErrorBoundary error={error} />;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScreenHeader title="Transactions" />
      <FlatList
        data={transactions}
        renderItem={({ item }) => <TransactionCard transaction={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={Platform.OS === 'web' ? { paddingHorizontal: 40 } : undefined}
      />
    </SafeAreaView>
  );
}
```

Single route definition works across web, iOS, and Android with platform-specific optimizations.
