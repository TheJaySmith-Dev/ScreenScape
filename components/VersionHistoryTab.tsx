import React from 'react';
import { changelog, Version } from '../services/changelog';

const getChangeTypeClass = (type: 'feature' | 'fix' | 'improvement') => {
    switch (type) {
        case 'feature':
            return 'bg-green-500/20 text-green-300';
        case 'fix':
            return 'bg-red-500/20 text-red-300';
        case 'improvement':
            return 'bg-blue-500/20 text-blue-300';
        default:
            return 'bg-gray-500/20 text-gray-300';
    }
};

export const VersionHistoryTab: React.FC = () => {
    return (
        <div className="space-y-8">
            {changelog.map((version: Version) => (
                <div key={version.version} className="glass-panel p-6 rounded-xl">
                    <div className="flex items-baseline justify-between">
                        <h2 className="text-2xl font-bold text-white">Version {version.version}</h2>
                        <p className="text-sm text-gray-400">{version.date}</p>
                    </div>
                    <ul className="mt-4 space-y-2">
                        {version.changes.map((change, index) => (
                            <li key={index} className="flex items-center gap-4">
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${getChangeTypeClass(change.type)}`}>
                                    {change.type.toUpperCase()}
                                </span>
                                <p className="text-gray-300">{change.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};
