/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n\tfragment Task on Task {\n\t\tid\n\t\tdescription\n\t\tpriority\n\t\treminderAllDay\n\t\tstatus\n\t\treminderAt\n\t\ttitle\n\t\tcreatedAt\n\t}\n": typeof types.TaskFragmentDoc,
    "\n\tquery findTasks($priority: Priority, $status: Status) {\n\t\tfindTasks(priority: $priority, status: $status) {\n\t\t\tid\n\t\t\tpriority\n\t\t\tcreatedAt\n\t\t\treminderAllDay\n\t\t\tstatus\n\t\t\treminderAt\n\t\t\ttitle\n\t\t}\n\t}\n": typeof types.FindTasksDocument,
    "\n\tquery getTask($taskId: ID!) {\n\t\tgetTask(taskId: $taskId) {\n\t\t\tid\n\t\t\tpriority\n\t\t\tcreatedAt\n\t\t\tdescription\n\t\t\treminderAllDay\n\t\t\tstatus\n\t\t\treminderAt\n\t\t\ttitle\n\t\t}\n\t}\n": typeof types.GetTaskDocument,
    "\n\tmutation createTask($newTask: NewTaskInput!) {\n\t\tcreateTask(newTask: $newTask) {\n\t\t\t...Task\n\t\t}\n\t}\n": typeof types.CreateTaskDocument,
    "\n\tmutation updateTask($updateTask: UpdateTaskInput!) {\n\t\tupdateTask(updateTask: $updateTask) {\n\t\t\t...Task\n\t\t}\n\t}\n": typeof types.UpdateTaskDocument,
    "\n\tmutation trashTask($taskId: ID!) {\n\t\ttrashTask(taskId: $taskId)\n\t}\n": typeof types.TrashTaskDocument,
    "\n\tmutation updateTaskStatus($id: ID!, $status: Status!) {\n\t\tupdateTask(updateTask: { id: $id, status: $status }) {\n\t\t\tid\n\t\t\tstatus\n\t\t}\n\t}\n": typeof types.UpdateTaskStatusDocument,
};
const documents: Documents = {
    "\n\tfragment Task on Task {\n\t\tid\n\t\tdescription\n\t\tpriority\n\t\treminderAllDay\n\t\tstatus\n\t\treminderAt\n\t\ttitle\n\t\tcreatedAt\n\t}\n": types.TaskFragmentDoc,
    "\n\tquery findTasks($priority: Priority, $status: Status) {\n\t\tfindTasks(priority: $priority, status: $status) {\n\t\t\tid\n\t\t\tpriority\n\t\t\tcreatedAt\n\t\t\treminderAllDay\n\t\t\tstatus\n\t\t\treminderAt\n\t\t\ttitle\n\t\t}\n\t}\n": types.FindTasksDocument,
    "\n\tquery getTask($taskId: ID!) {\n\t\tgetTask(taskId: $taskId) {\n\t\t\tid\n\t\t\tpriority\n\t\t\tcreatedAt\n\t\t\tdescription\n\t\t\treminderAllDay\n\t\t\tstatus\n\t\t\treminderAt\n\t\t\ttitle\n\t\t}\n\t}\n": types.GetTaskDocument,
    "\n\tmutation createTask($newTask: NewTaskInput!) {\n\t\tcreateTask(newTask: $newTask) {\n\t\t\t...Task\n\t\t}\n\t}\n": types.CreateTaskDocument,
    "\n\tmutation updateTask($updateTask: UpdateTaskInput!) {\n\t\tupdateTask(updateTask: $updateTask) {\n\t\t\t...Task\n\t\t}\n\t}\n": types.UpdateTaskDocument,
    "\n\tmutation trashTask($taskId: ID!) {\n\t\ttrashTask(taskId: $taskId)\n\t}\n": types.TrashTaskDocument,
    "\n\tmutation updateTaskStatus($id: ID!, $status: Status!) {\n\t\tupdateTask(updateTask: { id: $id, status: $status }) {\n\t\t\tid\n\t\t\tstatus\n\t\t}\n\t}\n": types.UpdateTaskStatusDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tfragment Task on Task {\n\t\tid\n\t\tdescription\n\t\tpriority\n\t\treminderAllDay\n\t\tstatus\n\t\treminderAt\n\t\ttitle\n\t\tcreatedAt\n\t}\n"): (typeof documents)["\n\tfragment Task on Task {\n\t\tid\n\t\tdescription\n\t\tpriority\n\t\treminderAllDay\n\t\tstatus\n\t\treminderAt\n\t\ttitle\n\t\tcreatedAt\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery findTasks($priority: Priority, $status: Status) {\n\t\tfindTasks(priority: $priority, status: $status) {\n\t\t\tid\n\t\t\tpriority\n\t\t\tcreatedAt\n\t\t\treminderAllDay\n\t\t\tstatus\n\t\t\treminderAt\n\t\t\ttitle\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery findTasks($priority: Priority, $status: Status) {\n\t\tfindTasks(priority: $priority, status: $status) {\n\t\t\tid\n\t\t\tpriority\n\t\t\tcreatedAt\n\t\t\treminderAllDay\n\t\t\tstatus\n\t\t\treminderAt\n\t\t\ttitle\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery getTask($taskId: ID!) {\n\t\tgetTask(taskId: $taskId) {\n\t\t\tid\n\t\t\tpriority\n\t\t\tcreatedAt\n\t\t\tdescription\n\t\t\treminderAllDay\n\t\t\tstatus\n\t\t\treminderAt\n\t\t\ttitle\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery getTask($taskId: ID!) {\n\t\tgetTask(taskId: $taskId) {\n\t\t\tid\n\t\t\tpriority\n\t\t\tcreatedAt\n\t\t\tdescription\n\t\t\treminderAllDay\n\t\t\tstatus\n\t\t\treminderAt\n\t\t\ttitle\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation createTask($newTask: NewTaskInput!) {\n\t\tcreateTask(newTask: $newTask) {\n\t\t\t...Task\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation createTask($newTask: NewTaskInput!) {\n\t\tcreateTask(newTask: $newTask) {\n\t\t\t...Task\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation updateTask($updateTask: UpdateTaskInput!) {\n\t\tupdateTask(updateTask: $updateTask) {\n\t\t\t...Task\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation updateTask($updateTask: UpdateTaskInput!) {\n\t\tupdateTask(updateTask: $updateTask) {\n\t\t\t...Task\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation trashTask($taskId: ID!) {\n\t\ttrashTask(taskId: $taskId)\n\t}\n"): (typeof documents)["\n\tmutation trashTask($taskId: ID!) {\n\t\ttrashTask(taskId: $taskId)\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tmutation updateTaskStatus($id: ID!, $status: Status!) {\n\t\tupdateTask(updateTask: { id: $id, status: $status }) {\n\t\t\tid\n\t\t\tstatus\n\t\t}\n\t}\n"): (typeof documents)["\n\tmutation updateTaskStatus($id: ID!, $status: Status!) {\n\t\tupdateTask(updateTask: { id: $id, status: $status }) {\n\t\t\tid\n\t\t\tstatus\n\t\t}\n\t}\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;