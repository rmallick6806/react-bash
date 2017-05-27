import * as Util from './util';
import _ from 'lodash';

export const chat = {
    exec: (state, arg, parentCommands) => {
      let input = _.words(_.toLower(arg.input));
      if (_.includes(input, 'who', 'you')) {
        parentCommands.chatResponse('whoAreYou');
      }
      return state;
    }
};
