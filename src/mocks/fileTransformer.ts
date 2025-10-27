/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import path from 'path';

export default {
process(sourceText: string, sourcePath: string) {
return {
code: `export default ${JSON.stringify(path.basename(sourcePath))};`
};
}
};
