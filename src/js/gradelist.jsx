import React, { useEffect, useState, useMemo, useRef } from 'react';
import store from '../js/store.js';

function updateGradelist(term, termGradelist) {
    const user = store.state.currentUser;
    const updatedGradelist = {
        ...user.gradelist,
        [term]: { ...termGradelist, lastUpdated: user.gradelist[term].lastUpdated },
    };
    store.dispatch('setGradelist', {
        gradelist: updatedGradelist
    });
}

const updateTermGradelist = (term, classes) => {
    const user = store.state.currentUser;
    const previousTerm = Object.keys(user.gradelist).pop();
    const previousTermGradelist = user.gradelist[previousTerm] || {};
    const updatedTermGradelist = Object.keys(previousTermGradelist).reduce((acc, key) => {
        const item = classes.find(cls => cls.name === key);
        if (item) {
            acc[key] = {
                ...previousTermGradelist[key],
                average: item.average,
                course: item.course,
                scores: item.scores || [],
                categories: item.categories || {},
                history: previousTermGradelist[key].history || {},
            };
        }
        return acc;
    }, {});

    classes.forEach(item => {
        if (!updatedTermGradelist[item.name]) {
            updatedTermGradelist[item.name] = {
                hide: false,
                rename: item.name,
                average: item.average,
                course: item.course,
                scores: item.scores || [],
                categories: item.categories || {},
                history: {},
            };
        }
    });

    updatedTermGradelist.lastUpdated = new Date();

    const updatedGradelist = {
        ...user.gradelist,
        [term]: updatedTermGradelist,
    };

    store.dispatch('setGradelist', {
        gradelist: updatedGradelist
    })


    return updatedGradelist;
};

const updateScoresIncludedHistory = (term, classes) => {
    const user = store.state.currentUser;
    const termGradelist = user.gradelist[term] || {};

    for (const cls of classes) {
        let today = new Date();
        const history = termGradelist[cls.name].history || {};

        const existingKeys = Object.keys(history);
        for (const key of existingKeys) {
            if (JSON.stringify(history[key]) === JSON.stringify(cls)) {
                delete history[key];
            }
        }

        history[today] = cls;
        termGradelist[cls.name].history = history;
    }

    const updatedGradelist = {
        ...user.gradelist,
        [term]: termGradelist,
    };

    store.dispatch('setGradelist', {
        gradelist: updatedGradelist
    });

    return updatedGradelist;
};

export { updateGradelist, updateTermGradelist, updateScoresIncludedHistory }