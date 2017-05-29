import * as Util from './util';
import _ from 'lodash';

export const chat = {
    exec: (state, arg, parentCommands) => {
      let input = _.words(_.toLower(arg.input));
      if (_.includes(input, 'who', 'you')) {
        parentCommands.chatResponse('whoAreYou');
      }

      else if (_.includes(input, 'explain')) {

      }

      else if (_.includes(input, 'what', 'mean')) {

      }

      else if (_.includes(input, 'who', 'watching')) {

      }

      else {
        parentCommands.chatResponse('confusedResponse');
      }

      return state;
    }
};
