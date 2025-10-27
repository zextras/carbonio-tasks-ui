/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { vi } from 'vitest';

// Mock carbonio-shell-ui to use our manual mock
vi.mock('@zextras/carbonio-shell-ui', async (importOriginal) => {
const mockModule = await import('../__mocks__/@zextras/carbonio-shell-ui');
return mockModule;
});
