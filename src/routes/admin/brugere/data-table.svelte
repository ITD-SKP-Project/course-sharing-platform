<script lang="ts">
	import { createTable, Render, Subscribe, createRender } from 'svelte-headless-table';
	import DataTableActions from './data-table-actions.svelte';
	import * as Table from '$lib/components/ui/table';
	export let currentUser: User;
	export let data: UserExludingPassword[];
	import {
		addPagination,
		addSortBy,
		addTableFilter,
		addSelectedRows
	} from 'svelte-headless-table/plugins';
	import DataTableCheckbox from './data-table-checkbox.svelte';
	import { Button } from '$lib/components/ui/button';
	import { ArrowUpDown } from 'lucide-svelte';
	import { readable } from 'svelte/store';
	import { Input } from '$lib/components/ui/input';
	import type { UserExludingPassword, User } from '$lib/types';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	let loaded = false;
	// onMount(() => {
	// 	loaded = true;
	// 	setTimeout(() => {
	// 		const toastData = localStorage.getItem('toast');
	// 		if (toastData) {
	// 			console.log('sending toast');
	// 			const { title, description } = JSON.parse(localStorage.getItem('toast')!);
	// 			toast(title, { description: description || '' });
	// 			localStorage.removeItem('toast');
	// 		}
	// 	}, 500);
	// });
	const table = createTable(readable(data), {
		page: addPagination(),
		sort: addSortBy(),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase())
		}),
		select: addSelectedRows()
	});

	const columns = table.createColumns([
		table.column({
			accessor: 'id',
			header: (_, { pluginStates }) => {
				const { allPageRowsSelected } = pluginStates.select;
				return createRender(DataTableCheckbox, {
					checked: allPageRowsSelected,
					value: 'ID'
				});
			},
			cell: ({ row, value }, { pluginStates }) => {
				const { getRowState } = pluginStates.select;
				const { isSelected } = getRowState(row);
				return createRender(DataTableCheckbox, {
					checked: isSelected,
					value: value
				});
			},
			plugins: {
				sort: {
					disable: true
				}
			}
		}),
		table.column({
			accessor: 'firstname',
			header: 'Fornavn'
		}),

		table.column({
			accessor: 'lastname',
			header: 'Efternavn'
		}),
		table.column({
			accessor: 'email',
			header: 'Email'
		}),
		table.column({
			accessor: 'validated',
			header: 'Aktiveret',
			plugins: {
				sort: {
					disable: true
				},
				filter: {
					exclude: true
				}
			},
			cell: ({ value }) => {
				return value ? 'Ja' : 'Nej';
			}
		}),
		table.column({
			accessor: 'authority_level',
			header: 'Retighedsniveau',
			plugins: {
				sort: {
					disable: true
				},
				filter: {
					exclude: true
				}
			},
			cell: ({ value }) => {
				switch (value) {
					case 1:
						return 'Bruger';
					case 2:
						return 'Projekt Moderator';
					case 3:
						return 'Bruge Moderator';
					case 4:
						return 'Administrator';
					case 5:
						return 'Jeff Bezos';
					default:
						return 'Ukendt';
				}
			}
		}),
		table.column({
			accessor: 'created_at',
			header: 'Oprettet',
			plugins: {
				sort: {
					disable: true
				},
				filter: {
					exclude: true
				}
			},
			cell: ({ value }) => {
				const date = new Date(value);
				return date.toLocaleTimeString().toString() + '\n' + date.toLocaleDateString().toString();
			}
		}),
		table.column({
			accessor: 'updated_at',
			header: 'Opdateret',
			plugins: {
				sort: {
					disable: true
				},
				filter: {
					exclude: true
				}
			},
			cell: ({ value }) => {
				const date = new Date(value);
				return date.toLocaleTimeString().toString() + '\n' + date.toLocaleDateString().toString();
			}
		}),
		table.column({
			accessor: 'email_verified',
			header: 'Email verificeret',
			plugins: {
				sort: {
					disable: true
				},
				filter: {
					exclude: true
				}
			},
			cell: ({ value }) => {
				return value ? 'Ja' : 'Nej';
			}
		}),
		table.column({
			accessor: 'context',
			header: 'Ny bruger',
			plugins: {
				sort: {
					disable: true
				},
				filter: {
					exclude: true
				}
			},
			cell: ({ value }) => {
				return value ? 'Ja' : 'Nej';
			}
		}),
		table.column({
			accessor: ({ id }) => id,
			header: '',
			cell: ({ value }) => {
				return createRender(DataTableActions, {
					user: data.find((user) => user.id === value)!,
					currentUser: currentUser
				});
			},
			plugins: {
				sort: {
					disable: true
				}
			}
		})
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates, rows } =
		table.createViewModel(columns);
	const { hasNextPage, hasPreviousPage, pageIndex, pageSize, pageCount } = pluginStates.page;

	const { filterValue } = pluginStates.filter;
	const { selectedDataIds } = pluginStates.select;
	$: console.log($selectedDataIds);

	table.data.subscribe((data) => data);

	function getTheFreakingData(data: any, ids: string[]) {
		const objects = ids.map((id) => data[+id]) as UserExludingPassword[];
		const userIds = objects.map((o) => o.id);
		return userIds;
	}
	async function deleteUsers() {
		let data: any;
		const unsub = table.data.subscribe((d) => (data = d));
		unsub();
		let userIds = getTheFreakingData(data, Object.keys($selectedDataIds));
		const res = await fetch(`/api/users/delete?ids=${JSON.stringify(userIds)}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		console.log(res);
		if (res.ok) {
			if (loaded)
				localStorage.setItem('toast', JSON.stringify({ title: 'Brugeren/e er blevet slettet.' }));
			// window.location.href = '/admin/brugere';
		} else {
			const json = await res.json();
			toast('Der skete en fejl', { description: json.message, duration: 5000 });
		}
	}
	async function activateUser() {
		let data: any;
		const unsub = table.data.subscribe((d) => (data = d));
		unsub();
		let userIds = getTheFreakingData(data, Object.keys($selectedDataIds));
		const res = await fetch(`/api/users/activate?ids=${JSON.stringify(userIds)}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (res.ok) {
			//put message in local storage
			if (loaded)
				localStorage.setItem('toast', JSON.stringify({ title: 'Brugeren/e er blevet aktiveret.' }));
			window.location.href = '/admin/brugere';
		} else {
			const json = await res.json();
			toast('Der skete en fejl', { description: json.message, duration: 5000 });
		}
	}
	async function deactivateUser() {
		let data: any;
		const unsub = table.data.subscribe((d) => (data = d));
		unsub();
		let userIds = getTheFreakingData(data, Object.keys($selectedDataIds));
		const res = await fetch(`/api/users/deactivate?ids=${JSON.stringify(userIds)}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (res.ok) {
			//put message in local storage
			if (loaded)
				localStorage.setItem(
					'toast',
					JSON.stringify({ title: 'Brugeren/e er blevet deaktiveret.' })
				);
			window.location.href = '/admin/brugere';
		} else {
			const json = await res.json();
			toast('Der skete en fejl', {
				description: json.message,
				duration: 5000
			});
		}
	}

	let confirnDelete = '';
</script>

<div>
	<div class="flex items-center gap-2 py-4">
		<Input
			class="max-w-sm"
			placeholder="Søg efter navn eller email..."
			type="text"
			bind:value={$filterValue}
		/>
		<AlertDialog.Root>
			<AlertDialog.Trigger asChild let:builder>
				<Button
					builders={[builder]}
					disabled={Object.keys($selectedDataIds).length === 0}
					class="px-4"
					variant="destructive">Slet</Button
				>
			</AlertDialog.Trigger>
			<AlertDialog.Content>
				<AlertDialog.Header>
					<AlertDialog.Title
						>Er du sikker på du vil slette {Object.keys($selectedDataIds).length > 1
							? 'disse brugere'
							: 'denne bruger'} permanent?</AlertDialog.Title
					>
					<AlertDialog.Description>
						Dette kan ikke fortrydes. Alle brugerens data vil blive slettet permanent. Alle
						brugerens projekter vil stadig eksistere men vil ikke være tilknyttet en bruger.
					</AlertDialog.Description>
				</AlertDialog.Header>

				<AlertDialog.Footer class="m-0 w-full p-0">
					<div class="flex w-full flex-col">
						<p>
							Skriv <strong
								>{Object.keys($selectedDataIds).length > 1 ? 'slet brugere' : 'slet bruger'}</strong
							> før du kan slette din konto.
						</p>
						<div class="flex w-48 flex-col gap-2">
							<Input
								class=" w-full border-destructive outline-destructive"
								bind:value={confirnDelete}
							></Input>
							<div class=" mr-auto flex flex-row">
								<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
								<AlertDialog.Action asChild let:builder>
									<Button
										disabled={Object.keys($selectedDataIds).length > 1
											? confirnDelete.toLowerCase() != 'slet brugere'
											: confirnDelete.toLowerCase() != 'slet bruger'}
										builders={[builder]}
										on:click={deleteUsers}
										variant="destructive">Slet forevigt</Button
									>
								</AlertDialog.Action>
							</div>
						</div>
					</div>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>

		<Button
			on:click={deactivateUser}
			disabled={Object.keys($selectedDataIds).length === 0}
			class=" bg-yellow-400 px-4 text-yellow-950 hover:bg-yellow-500">Deaktiver</Button
		>
		<Button on:click={activateUser} disabled={Object.keys($selectedDataIds).length === 0}
			>Aktiver</Button
		>
		<!-- <Button class="ml-auto px-4">Opret</Button> -->
	</div>
	<div class="rounded-md border">
		<Table.Root {...$tableAttrs}>
			<Table.Header>
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
									<Table.Head {...attrs} class="[&:has([role=checkbox])]:pl-3">
										{#if cell.id === 'email'}
											<Button variant="ghost" on:click={props.sort.toggle}>
												<Render of={cell.render()} />
												<ArrowUpDown class="h-4 w-4" />
											</Button>
										{:else}
											<Render of={cell.render()} />
										{/if}
									</Table.Head>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Header>
			<Table.Body {...$tableBodyAttrs}>
				{#each $pageRows as row (row.id)}
					<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
						<Table.Row {...rowAttrs} data-state={$selectedDataIds[row.id] && 'selected'}>
							{#each row.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs>
									<Table.Cell
										class={(cell.id == 'context' && cell.render().toString() == 'Ja') ||
										(cell.id == 'validated' && cell.render().toString() == 'Nej')
											? ' font-bold text-red-500'
											: ''}
										{...attrs}
									>
										<Render of={cell.render()} />
									</Table.Cell>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<div class="flex items-center justify-end space-x-4 py-4">
		<div class="flex-1 text-sm text-muted-foreground">
			{Object.keys($selectedDataIds).length} of{' '}
			{$rows.length} row(s) selected.
		</div>
		<div class="flex items-center">
			<p class="text-sm text-muted-foreground">Side {$pageIndex + 1} af {$pageCount}.</p>
			<Button
				variant="outline"
				size="sm"
				on:click={() => ($pageIndex = $pageIndex - 1)}
				disabled={!$hasPreviousPage}>Previous</Button
			>
			<Button
				variant="outline"
				size="sm"
				disabled={!$hasNextPage}
				on:click={() => ($pageIndex = $pageIndex + 1)}>Next</Button
			>
		</div>
	</div>
</div>
