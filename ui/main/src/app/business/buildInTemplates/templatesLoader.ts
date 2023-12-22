/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {MessageCardTemplate} from './message/messageCardTemplate';
import {MessageUserCardTemplate} from './message/messageUserCardTemplate';
import {QuestionCardTemplate} from './question/card/questionCardTemplate';
import {QuestionUserCardTemplate} from './question/usercard/questionUserCardTemplate';
import {TaskCardTemplate} from './task/card/taskCardTemplate';
import {TaskUserCardTemplate} from './task/usercard/taskUserCardTemplate';
import {MessageOrQuestionListCardTemplate} from './message-or-question-list/card/message-or-question-listCardTemplate';
import {MessageOrQuestionListUserCardTemplate} from './message-or-question-list/usercard/message-or-question-listUserCardTemplate';


export const loadBuildInTemplates = () => {
    customElements.define('opfab-message-card', MessageCardTemplate);
    customElements.define('opfab-message-usercard', MessageUserCardTemplate);
    customElements.define('opfab-question-card', QuestionCardTemplate);
    customElements.define('opfab-question-usercard', QuestionUserCardTemplate);
    customElements.define('opfab-task-card', TaskCardTemplate);
    customElements.define('opfab-task-usercard', TaskUserCardTemplate);
    customElements.define('opfab-message-or-question-list-usercard', MessageOrQuestionListUserCardTemplate);
    customElements.define('opfab-message-or-question-list-card', MessageOrQuestionListCardTemplate);
};
