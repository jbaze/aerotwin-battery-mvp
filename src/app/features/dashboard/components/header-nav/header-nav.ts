import { Component, EventEmitter, Input, Output } from '@angular/core';

export type TabType = 'system' | 'device';

@Component({
  selector: 'app-header-nav',
  standalone: false,
  templateUrl: './header-nav.html',
  styleUrl: './header-nav.scss'
})
export class HeaderNav {
  @Input() activeTab: TabType = 'system';
  @Output() tabChange = new EventEmitter<TabType>();

  onTabClick(tab: TabType): void {
    if (tab !== this.activeTab) {
      this.activeTab = tab;
      this.tabChange.emit(tab);
    }
  }

  getTabClasses(tab: TabType): string {
    const baseClasses = 'relative px-3 py-2 md:px-4 md:py-2 text-sm font-medium rounded-full transition-all duration-200 ease-in-out';
    const activeClasses = 'bg-teal-600 text-white shadow-md';
    const inactiveClasses = 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700';

    return `${baseClasses} ${tab === this.activeTab ? activeClasses : inactiveClasses}`;
  }

  getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
