/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {ConfigService} from 'app/business/services/config.service';
import {LoggerService as logger} from 'app/business/services/logs/logger.service';

@Component({
    selector: 'of-logo',
    templateUrl: './logo.component.html',
    styleUrls: ['./logo.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoComponent implements OnInit {
    base64Image: string;
    height: number;
    width: number;

    DEFAULT_HEIGHT = 40;
    DEFAULT_WIDTH = 40;
    MAX_HEIGHT = 48;

    opfabLogoStyle = false;

    constructor(public domSanitizationService: DomSanitizer) {}

    ngOnInit() {
        const logo = ConfigService.getConfigValue('logo.base64');
        if (logo) {
            this.base64Image = `data:image/svg+xml;base64,${logo}`;
        }
        const logo_height = ConfigService.getConfigValue('logo.height');
        if (logo_height) {
            this.height = logo_height;
        }
        const logo_width = ConfigService.getConfigValue('logo.width');
        if (logo_width) {
            this.width = logo_width;
        }

        if (this.base64Image === undefined || this.base64Image === '') {
            this.base64Image = this.getOpfabLogo();
            this.height = 32;
            this.width = 32;
            this.opfabLogoStyle = true;
        }
        if (this.height === undefined) this.height = this.DEFAULT_HEIGHT;
        if (this.width === undefined) this.width = this.DEFAULT_WIDTH;
        if (this.height > this.MAX_HEIGHT) {
            logger.error('Logo height > 48px in web-ui.json, height will be set to 48px ');
            this.height = this.MAX_HEIGHT;
        }
    }

    public getImage(): SafeUrl {
        return this.domSanitizationService.bypassSecurityTrustUrl(this.base64Image);
    }

    private getOpfabLogo(): string {
        return 'data:image/svg+xml;base64,PCEtLQpDb3B5cmlnaHQgKGMpIDIwMTgtMjAyMSBSVEUgKGh0dHA6Ly93d3cucnRlLWZyYW5jZS5jb20pClNlZSBBVVRIT1JTLnR4dApUaGlzIGRvY3VtZW50IGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zIG9mIHRoZSBDcmVhdGl2ZSBDb21tb25zIEF0dHJpYnV0aW9uIDQuMCBJbnRlcm5hdGlvbmFsIGxpY2Vuc2UuCklmIGEgY29weSBvZiB0aGUgbGljZW5zZSB3YXMgbm90IGRpc3RyaWJ1dGVkIHdpdGggdGhpcwpmaWxlLCBZb3UgY2FuIG9idGFpbiBvbmUgYXQgaHR0cHM6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzQuMC8uClNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBDQy1CWS00LjAKLS0+Cjxzdmcgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxnIGZpbGw9IiM0MTAwOTkiPgogICAgPHBhdGggY2xhc3M9InN0MiIgZD0iTTI0Ljg3MSA0Ny4zMTNjLjQ1MS0xLjEyOC4yMjYtMi40MjUtLjY3Ny0zLjI3bC00LjIyOS00LjI4NmEzLjA1IDMuMDUgMCAwIDAtMy4yNy0uNjc3bC01LjAxOSAyLjA4Ni0yLjI1NSAxMy40MiAxMy40Mi0yLjI1NXpNNDEuMTY3IDExLjY3NWwtMi4wODYgNS4wMTljLS40NTEgMS4xMjgtLjIyNiAyLjQyNS42NzYgMy4yN2w0LjI4NiA0LjI4NmEzLjA1IDMuMDUgMCAwIDAgMy4yNy42NzdsNS4wMTktMi4wODcgMi4yNTUtMTMuNDJ6TTM3Ljc4NCA0Ny44MmMtLjQ1MS0xLjEyOC0xLjU3OS0xLjg2LTIuNzYzLTEuODZoLTYuMDljLTEuMjQgMC0yLjMxMi43MzItMi43NjMgMS44NmwtMi4wODYgNS4wNzUgNy44OTQgMTEuMTA4aC4wNTZsNy44OTUtMTEuMTA4ek01Mi44NCAyNC4xMzdsLTUuMDE5IDIuMDg3Yy0xLjEyOC40NS0xLjg2IDEuNTc4LTEuODYgMi43NjN2Ni4wMzNjMCAxLjI0LjczMiAyLjMxMiAxLjg2IDIuNzYzbDUuMDc1IDIuMDg2IDExLjEwOC03Ljg5NHpNNDcuMzEzIDM5LjA4Yy0xLjEyNy0uNDUxLTIuNDI0LS4yMjYtMy4yNy42NzdsLTQuMjg2IDQuMjg1YTMuMDUgMy4wNSAwIDAgMC0uNjc2IDMuMjdsMi4wODYgNS4wNzYgMTMuNDIgMi4yNTUtMi4yNTUtMTMuNDJ6TTExLjYyIDIyLjg0bDUuMDE4IDIuMDg3YzEuMTI4LjQ1IDIuNDI1LjIyNSAzLjI3MS0uNjc3bDQuMjg1LTQuMjg2YTMuMDUgMy4wNSAwIDAgMCAuNjc3LTMuMjdsLTIuMDg2LTUuMDE5TDkuMzY1IDkuNDJ6TTE2LjEzMSAzNy44NGMxLjEyOC0uNDUyIDEuODYtMS41OCAxLjg2LTIuNzY0di02LjA5YzAtMS4yNC0uNzMyLTIuMzExLTEuODYtMi43NjJsLTUuMDE5LTIuMDg3TC4wMDQgMzIuMDMxbDExLjEwOCA3Ljg5NXpNMjQuMDgyIDExLjExMmwyLjA4NiA1LjAxOGMuNDUxIDEuMTI4IDEuNTc5IDEuODYgMi43NjMgMS44Nmg2LjAzNGMxLjI0IDAgMi4zMTEtLjczMiAyLjc2My0xLjg2bDIuMDg2LTUuMDE4TDMxLjkyLjAwM3oiLz4KICA8L2c+CiAgPGcgZmlsbD0iIzc0NzNjMCI+CiAgICA8cGF0aCBjbGFzcz0ic3QzIiBkPSJNOS4zNjQgNTQuNjQzbDUuNjQgNS42MzkuMDU2LjA1NmMxLjUyMiAxLjUyMyA0LjA2Ljk1OSA0Ljg0OS0xLjAxNWwyLjg3Ni02LjkzNXpNNTQuNTg3IDkuNDJMNDguOTUgMy43MjVsLS4wNTctLjA1N2MtMS41MjItMS41MjItNC4wNi0uOTU4LTQuODQ5IDEuMDE1bC0yLjg3NiA2Ljk5MnpNMzkuODcgNTIuODk1bC03Ljg5NCAxMS4xMDhoOC4wNjNjMi4xNDMgMCAzLjU1My0yLjE5OSAyLjcwNy00LjE3MnpNNjMuOTQ4IDI0LjAyNGMwLTIuMTQyLTIuMi0zLjYwOC00LjE3My0yLjc2M2wtNi45MzYgMi44NzYgMTEuMTA5IDcuODk0ek01OS4yNjggNDQuMDQybC02LjkzNi0yLjg3NiAyLjI1NSAxMy40MiA1LjY0LTUuNjM4LjA1Ni0uMDU3YzEuNTIyLTEuNDY2Ljk1OC00LjAwMy0xLjAxNS00Ljg0OXpNNC42ODQgMTkuOTY0bDYuOTM2IDIuODc2TDkuMzY0IDkuNDJsLTUuNjM4IDUuNjM5LS4wNTcuMDU2Yy0xLjQ2NiAxLjQ2Ni0uOTU4IDQuMDA0IDEuMDE1IDQuODV6TTQuMTc3IDQyLjgwMmw2LjkzNS0yLjg3NkwuMDA0IDMyLjAzdjguMDY0YzAgMi4wODYgMi4yIDMuNDk2IDQuMTczIDIuNzA3ek0yNC4wODIgMTEuMTEyTDMxLjk3Ni4wMDNoLTguMDYzYy0yLjE0MyAwLTMuNTUzIDIuMi0yLjcwNyA0LjE3M3oiLz4KICA8L2c+CiAgPHBhdGggY2xhc3M9InN0NCIgZD0iTTQuNjg0IDQ0LjA0MmMtMS45NzMuNzktMi40OCAzLjM4My0xLjAxNSA0Ljg1bC4wNTcuMDU2IDUuNjM4IDUuNjM5IDIuMjU2LTEzLjQyek01MS45OTQgMjIuODRsNi44NzktMi44NzZjMS45NzQtLjc4OSAyLjQ4MS0zLjM4MyAxLjAxNS00Ljg0OWwtLjA1Ni0uMDU2LTUuNjQtNS42Mzl6TTIxLjA5MyA1OS44M2MtLjc5IDEuOTc0LjYyIDQuMTczIDIuNzA3IDQuMTczaDguMDA3bC03Ljg5NC0xMS4xMDh6TTU5LjM4IDQyLjgwMmMxLjk3NC43ODkgNC4xMTctLjYyIDQuMTE3LTIuNzA3di04LjA2NEw1Mi41IDM5LjkyNnpNNDMuNzYxIDU5LjI2N2MuNzkgMS45NzMgMy4zMjcgMi41MzcgNC44NSAxLjAxNWwuMDU2LS4wNTcgNS41ODItNS42MzgtMTMuMzA3LTIuMjU2ek0yMi42NzIgMTEuNjc1TDE5Ljc5NiA0Ljc0Yy0uNzktMS45NzQtMy4zMjctMi41MzgtNC44NS0xLjAxNWwtLjA1Ni4wNTZMOS4yNTIgOS40MnpNNC4xMiAyMS4yNjFjLTEuOTE3LS44NDUtNC4xMTYuNTY0LTQuMTE2IDIuNzA3djguMDYzbDExLjA1Mi03Ljg5NHpNMzkuNTg4IDExLjE2OGwyLjg3Ni02LjkzNmMuNzktMS45NzMtLjYyLTQuMTcyLTIuNzA3LTQuMTcySDMxLjc1eiIgZmlsbD0iI2ZmNjQ3ZCIvPgo8L3N2Zz4K';
    }
}
